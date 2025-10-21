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
- Minimal API surface - currently uses mock data (in-memory storage)
- RESTful API design pattern (routes prefixed with `/api`)

**Development vs Production:**
- Development: Vite dev server with HMR, middleware mode
- Production: Pre-built static assets served by Express
- Replit-specific plugins for development environment integration

**Storage Interface:**
- Abstract `IStorage` interface defining CRUD operations
- Current implementation: `MemStorage` (in-memory Map-based storage)
- Designed for easy migration to database backend (Drizzle ORM + PostgreSQL ready)
- User model defined but not currently utilized by the application

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

**Drizzle ORM Configuration:**
- Configured for PostgreSQL via `@neondatabase/serverless`
- Schema file: `shared/schema.ts`
- Migration directory: `./migrations`
- Database push script available: `npm run db:push`
- Currently not connected - prepared for future backend integration

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

### Backend & Database (Configured, Not Active)
- **Drizzle ORM**: TypeScript ORM for SQL databases
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **connect-pg-simple**: PostgreSQL session store for Express
- **drizzle-zod**: Automatic Zod schema generation from Drizzle schemas

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
- Schema-first design allows frontend development while backend evolves
- Migration system ready for when database is provisioned