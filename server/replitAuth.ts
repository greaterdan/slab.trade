import passport from "passport";
import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Development mode detection
const isDevelopment = process.env.NODE_ENV === "development";

if (!process.env.SESSION_SECRET) {
  console.warn("SESSION_SECRET environment variable is not set, using fallback for development");
  process.env.SESSION_SECRET = "dev-session-secret-not-secure";
}

// Google OAuth environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("GOOGLE_CLIENT_ID environment variable is not set, Google OAuth will not work");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("GOOGLE_CLIENT_SECRET environment variable is not set, Google OAuth will not work");
}

// Removed Replit OIDC - using Google OAuth instead

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

// Removed Replit-specific user session functions

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${process.env.DOMAIN || 'localhost:3000'}/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Create or update user from Google profile
        const userData = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          profileImageUrl: profile.photos?.[0]?.value,
        };

        await storage.upsertUser(userData);
        
        const user = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          access_token: accessToken,
          refresh_token: refreshToken,
          provider: 'google'
        };

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }));
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
      // Production: redirect to Google OAuth
      res.redirect("/api/auth/google");
    }
  });

  // Removed Replit callback - using Google OAuth callback instead

  // Google OAuth routes
  app.get("/api/auth/google", (req, res, next) => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.authenticate("google", {
        scope: ["profile", "email"]
      })(req, res, next);
    } else {
      res.status(500).json({ message: "Google OAuth not configured" });
    }
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login?error=google_auth_failed"
    })(req, res, next);
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
