# SLAB - Solana Launchpad & Bonding Markets

## Overview

SLAB is a decentralized exchange (DEX) platform for launching and trading perpetual markets with bonding curves on Solana. The platform enables creators to launch new markets that progress through three distinct phases: Bonding (initial price discovery), Warmup (transition period with limited trading), and Perps (full perpetual futures trading). The application features a sophisticated trading interface inspired by professional trading platforms, with real-time market data, order books, and comprehensive market management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack Query (React Query) for server state management and caching
- Zustand for client-side state management (markets, trading, launch wizard)
- Framer Motion for animations and transitions
- Tailwind CSS for styling with custom Solana-branded dark theme

**UI Component System:**
- shadcn/ui component library (Radix UI primitives)
- Custom design system based on Solana brand colors (purple #9945FF, mint #14F195, aqua #00FFA3)
- Dark-first UI with deep space backgrounds (#131313, #171717)
- Consistent elevation system using subtle transparency overlays

**State Management Pattern:**
- Three primary Zustand stores:
  - `useMarketsStore`: Manages market data, order books, and recent trades
  - `useLaunchStore`: Handles multi-step market creation wizard state
  - `useTradeStore`: Manages user positions, pending orders, and balances
- React Query for server-side data fetching with automatic caching and refetching
- No global Redux or Context API - stores are isolated by domain

**Page Structure:**
- Dashboard: Featured markets, market creation CTA, markets table
- Launch: Multi-step wizard (5 steps) for creating new markets
- Market Detail: Trading interface with charts, order books, trade tickets (bonding or perps)
- Discover: Market exploration with filtering and search
- Creator: Analytics dashboard for market creators
- Docs: External documentation links

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Custom Vite middleware integration for development
- PostgreSQL database with Drizzle ORM for data persistence
- RESTful API design pattern (routes prefixed with `/api`)

**Authentication & Authorization:**
- **Replit Auth Integration**: OAuth-based authentication supporting Google, GitHub, X (Twitter), Apple, and email/password login
- **Session Management**: Express sessions backed by PostgreSQL (`connect-pg-simple`)
- **Protected Routes**: Launch and Creator pages require authentication
- **Auth Flow**: Unauthenticated users see `null` from `/api/auth/user` (200 response), authenticated users receive user object with wallet info
- **Security**: SESSION_SECRET environment variable required for session encryption

**Custodial Wallet System:**
- **Auto-Generation**: Each user automatically receives a Solana wallet on first login
- **Encryption**: Private keys encrypted using AES-256-CBC with WALLET_ENCRYPTION_KEY environment variable
- **Storage**: Wallets table stores encrypted private key, public key, and SOL balance for each user
- **Export**: Users can export their private key via secure clipboard copy (requires HTTPS)
- **Balance Tracking**: Wallet balances fetched from Solana blockchain (devnet) and cached in database

**Development vs Production:**
- Development: Vite dev server with HMR, middleware mode
- Production: Pre-built static assets served by Express
- Replit-specific plugins for development environment integration

**Storage Architecture:**
- **Database**: PostgreSQL via `@neondatabase/serverless` (Neon serverless driver)
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Storage Interface**: `IStorage` interface with `DbStorage` implementation for database operations
- **Tables**: users (auth data), sessions (Express sessions), wallets (encrypted Solana keypairs)

### Data Layer Design

**Schema Architecture:**
- Centralized schema definitions in `shared/schema.ts`
- TypeScript interfaces for type safety across client and server
- Market lifecycle: `bonding` → `warmup` → `perps`
- Complex nested configurations:
  - Bonding curve parameters (type, price, tax distribution)
  - Graduation triggers (liquidity, holders, age thresholds)
  - Perpetuals configuration (leverage, margins, funding rates)
  - Fee structures (taker/maker basis points, revenue splits)

**Mock Data Strategy:**
- Static JSON files in `client/src/mocks/` for development
- API functions in `client/src/lib/api.ts` simulate network latency
- Realistic order book and trade data generation
- Real-time updates simulated via intervals and random price movements

**Database Schema:**
- **users table**: Stores user authentication data (id, email, name, profile picture from OAuth provider)
- **sessions table**: Express session storage managed by `connect-pg-simple`
- **wallets table**: Custodial Solana wallets with encrypted private keys
  - userId: Foreign key to users table
  - publicKey: Solana public key (base58 encoded)
  - encryptedPrivateKey: AES-256-CBC encrypted private key
  - balance: Cached SOL balance from blockchain
- Schema file: `shared/schema.ts`
- Database push script: `npm run db:push` (or `npm run db:push --force` for schema changes)

**API Endpoints:**
- `GET /api/auth/user`: Returns current user with wallet info (or null if not authenticated)
- `GET /api/login`: Redirects to Replit Auth OAuth flow
- `GET /api/logout`: Ends session and redirects to home
- `GET /api/wallet/balance`: Fetches fresh balance from Solana blockchain
- `GET /api/wallet/export-key`: Returns decrypted private key for authenticated user

### Trading Interface Components

**Market Phases:**
1. **Bonding Phase**: Custom bonding curve panel with buy/sell tabs, tax breakdown, slippage calculation
2. **Warmup Phase**: Limited trading - longs enabled, shorts restricted with tooltip explanations
3. **Perps Phase**: Full perpetual futures trading ticket with leverage slider, position sizing, fee estimation

**Order Book & Trades:**
- Real-time order book with bid/ask depth visualization
- Percentage-based visual indicators for size distribution
- Live trades feed with buy/sell side indicators
- WebSocket-ready architecture (currently using polling simulation)

**Chart Integration:**
- `MiniCandleCanvas`: Canvas-based candlestick chart placeholder
- Prepared for integration with charting libraries (TradingView, Lightweight Charts)
- Toggle between candles and TWAP views
- Responsive sizing with device pixel ratio handling

### Styling and Theming

**Color System:**
- Background layers: #131313 (page), #171717 (card), #1B1B1B (elevated)
- Primary actions: Solana Mint (#14F195) with hover/pressed states
- Secondary interactions: Solana Aqua (#00FFA3)
- Accent highlights: Solana Purple (#9945FF)
- Semantic colors: Success (#1ED660), Warning (#F6C86E), Error (#FF3B3B)

**Tailwind Configuration:**
- CSS custom properties for theme colors using HSL values
- Alpha channel support for transparency effects
- Custom border radius scale (sm: .1875rem, md: .375rem, lg: .5625rem)
- Elevation utilities via custom CSS classes (`hover-elevate`, `active-elevate-2`)

**Typography:**
- Inter font family for UI text
- JetBrains Mono for numerical data and code
- Consistent `data-numeric="true"` attributes for monospace formatting

## External Dependencies

### UI Framework & Components
- **Radix UI**: Unstyled, accessible component primitives (@radix-ui/react-*)
- **shadcn/ui**: Pre-styled components built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variant management
- **Framer Motion**: Animation library for React

### State Management & Data Fetching
- **TanStack Query v5**: Server state management, caching, background refetching
- **Zustand**: Lightweight state management for client state
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation and type inference

### Routing & Navigation
- **Wouter**: Lightweight client-side routing (~1.2KB)

### Development Tools
- **Vite**: Build tool with fast HMR and optimized production builds
- **TypeScript**: Static type checking
- **esbuild**: Fast JavaScript/TypeScript bundler for server code
- **tsx**: TypeScript execution for development server

### Backend & Database
- **Drizzle ORM**: TypeScript ORM for SQL databases (actively used)
- **@neondatabase/serverless**: Serverless PostgreSQL driver (actively used)
- **connect-pg-simple**: PostgreSQL session store for Express (actively used)
- **drizzle-zod**: Automatic Zod schema generation from Drizzle schemas

### Blockchain & Wallet
- **@solana/web3.js**: Solana JavaScript SDK for wallet generation and blockchain interaction
- **bs58**: Base58 encoding/decoding for Solana addresses and private keys
- **Node crypto**: AES-256-CBC encryption for custodial wallet private keys

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **clsx & tailwind-merge**: Conditional className composition

### Platform Integration
- **Replit Vite Plugins**: Development environment integration (cartographer, dev banner, error overlay)

### Notes on Architecture Decisions

**Why Wouter over React Router?**
- Significantly smaller bundle size (~1.2KB vs ~30KB)
- Simpler API sufficient for single-page application needs
- Hook-based navigation matches React patterns

**Why Zustand over Redux?**
- Minimal boilerplate with direct state updates
- No provider wrapping required
- Better TypeScript inference
- Sufficient for application's state complexity

**Why Mock Data?**
- Enables full frontend development without backend dependency
- Realistic data structure validates UI/UX design
- Easy transition to real API (same interface pattern)
- Simulated latency helps identify loading states

**Database Strategy:**
- Drizzle ORM chosen for TypeScript-first approach and type safety
- PostgreSQL via Neon for serverless deployment compatibility
- Schema-first design with Drizzle's push-based migrations (no manual SQL)
- Database actively stores users, sessions, and encrypted wallet data

**Authentication Strategy:**
- Replit Auth chosen for seamless multi-provider OAuth (Google, GitHub, X, Apple, email)
- No manual credential management - delegated to Replit's auth infrastructure
- Automatic session management with PostgreSQL-backed sessions
- Protected routes use `useAuth` hook for client-side redirects

**Wallet Strategy:**
- Custodial wallets for ease of use - no browser wallet extensions required
- Users can export private keys to migrate to non-custodial wallets
- Encryption ensures private keys are never stored in plaintext
- Automatic wallet creation on first login eliminates friction

## Recent Changes

### October 21, 2025 - Percolator SDK Integration & On-Chain Market Creation
- **Built comprehensive TypeScript Percolator SDK** with 6 core modules:
  - `types.ts`: Fixed-point math (6 decimals), enums, RiskParams, WarmupConfig, data structures
  - `connection.ts`: Solana RPC connection, priority fee estimation, confirmation helpers
  - `pdas.ts`: PDA derivation for vault, escrow, cap, portfolio, slab, hold, position accounts
  - `router.ts`: Transaction builders for createMarket, mintCap, settleFunding, freeze/unfreeze
  - `slab.ts`: Transaction builders for initSlab, addInstrument, reserve, commit, cancel, batchOpen, liquidate
  - `flows.ts`: High-level operations (placePerpOrder flow, warmup guards, margin calculations)
- **Wired Launch page to real on-chain deployment**:
  - deployMarket() handler creates market ID, builds RiskParams and WarmupConfig from form
  - Prepares transactions for initSlab (10MB account), createMarket (router), addInstrument (slab)
  - Shows loading states and toast notifications
  - Transaction signing TODO (requires custodial wallet integration)
- **Configuration**: `.env.local` with mainnet Router/Slab program IDs and RPC endpoints
- **Architecture Decision**: Using deployed Percolator programs instead of building from source (Replit constraints)
- **Status**: Transaction structures verified by architect, serialization awaiting Percolator IDL documentation

### October 21, 2025 - Authentication & Custodial Wallet System
- Implemented Replit Auth for multi-provider login (Google, GitHub, X, Apple, email/password)
- Created PostgreSQL database with users, sessions, and wallets tables
- Built custodial wallet service with AES-256-CBC encrypted private key storage
- Auto-generate Solana keypair for each user on first login
- Protected Launch and Creator pages to require authentication
- Updated TopBar with Login/Logout buttons and wallet address display
- Added wallet balance display and private key export functionality
- Implemented secure authentication flow: unauthenticated users see null, authenticated users get wallet auto-created
- Security: WALLET_ENCRYPTION_KEY required (fails hard if missing), private keys never stored in plaintext