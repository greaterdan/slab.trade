import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Development mode detection
const isDevelopment = !process.env.REPLIT_DOMAINS || !process.env.REPL_ID || process.env.REPL_ID === "dev-repl-id";

if (!process.env.REPLIT_DOMAINS) {
  console.warn("REPLIT_DOMAINS environment variable is not set, using fallback for development");
  process.env.REPLIT_DOMAINS = "localhost:3000";
}

if (!process.env.REPL_ID) {
  console.warn("REPL_ID environment variable is not set, using fallback for development");
  process.env.REPL_ID = "dev-repl-id";
}

if (!process.env.SESSION_SECRET) {
  console.warn("SESSION_SECRET environment variable is not set, using fallback for development");
  process.env.SESSION_SECRET = "dev-session-secret-not-secure";
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  if (isDevelopment) {
    // In development mode, use memory store instead of PostgreSQL
    return session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Allow HTTP in development
        maxAge: sessionTtl,
      },
    });
  } else {
    // Production mode: use PostgreSQL store
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    return session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: sessionTtl,
      },
    });
  }
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `http://${domain}/api/callback`,
      },
      verify
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    if (isDevelopment) {
      // Development mode: create a mock user session
      const mockUser = {
        id: "dev-user-123",
        email: "dev@example.com",
        firstName: "Dev",
        lastName: "User",
        profileImageUrl: "https://via.placeholder.com/150",
        claims: {
          sub: "dev-user-123",
          email: "dev@example.com",
          first_name: "Dev",
          last_name: "User",
          profile_image_url: "https://via.placeholder.com/150"
        },
        access_token: "dev-access-token",
        refresh_token: "dev-refresh-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };
      
      req.login(mockUser, (err) => {
        if (err) {
          console.error("Development login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        // In development mode, skip database operations
        console.log("Development login successful - user:", mockUser.email);
        
        return res.redirect("/");
      });
    } else {
      const hostname = req.hostname === 'localhost' ? 'localhost:3000' : req.hostname;
      passport.authenticate(`replitauth:${hostname}`, {
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    }
  });

  app.get("/api/callback", (req, res, next) => {
    if (isDevelopment) {
      // In development mode, redirect to home since login is handled in /api/login
      return res.redirect("/");
    } else {
      const hostname = req.hostname === 'localhost' ? 'localhost:3000' : req.hostname;
      passport.authenticate(`replitauth:${hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      if (isDevelopment) {
        res.redirect("/");
      } else {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
