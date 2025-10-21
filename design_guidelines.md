# SLAB Design Guidelines

## Color System (Solana-Branded Dark UI)

**Core Neutrals**
- Page Background: #131313
- Surface: #171717
- Elevated: #1B1B1B
- Card Glass (alpha): rgba(255,255,255,0.03)
- Borders/Hairlines: #252525
- Divider Subtle: #1F1F1F

**Typography**
- Primary: #FFFFFF
- Secondary: #D7D7D7
- Muted: #A9A9A9
- Disabled: #6F6F6F

**Solana Accents (Sparingly)**
- Solana Purple: #9945FF
- Solana Mint: #14F195
- Solana Aqua: #00FFA3
- Deep Space: #0A0F1E
- Cosmic Indigo: #1C1B2E

**Semantic Colors**
- Primary Actions: #14F195 (hover #11D884, pressed #0FB978)
- Secondary Interactive: #00FFA3 (hover #29FFB4, pressed #0FEA9A)
- Tertiary Brand: #9945FF (hover #8A3DE6, pressed #7130C2)
- Info: #37A6FF
- Success: #1ED660
- Warning: #F6C86E
- Error/Urgency: #FF3B3B

**Gradients**
- Brand Sweep: linear-gradient(135deg, #9945FF 0%, #00FFA3 50%, #14F195 100%)
- CTA Glow Ring: conic-gradient(from 180deg, #14F195, #00FFA3, #9945FF, #14F195)
- Chart Line Accent: linear-gradient(180deg, #00FFA3 0%, rgba(0,255,163,0) 100%)

**Effects**
- Soft Elevation: 0 8px 24px rgba(0,0,0,0.45)
- Focus Ring: 0 0 0 2px rgba(20,241,149,0.35)
- Card Hover Outline: 0 0 0 1px #2A2A2A
- Backdrop: rgba(0,0,0,0.6)
- Popover Surface: #161616 with border #2A2A2A

## Layout System

**Grid Structure**
- Max Width: 1440px centered
- 12-column grid with tight gutters
- Fixed Left Rail: 80px with logo "SL" and vertical nav
- Top Bar: search, network pill, wallet connect, notifications
- Responsive breakpoints: mobile (bottom sheet), tablet (condensed), desktop (full grid)

## Component Specifications

**Button Styling**
- Primary: bg #14F195, text #0B0B0B
- Secondary: border #00FFA3, text #00FFA3, hover bg rgba(0,255,163,0.08)
- Danger: bg #FF3B3B, text #0B0B0B (high-commit actions only)
- Tabs/Active Pill: bg #171717, bottom bar #9945FF

**Navigation**
- Active item: orange pill + subtle glow effect
- Tooltips on hover for collapsed state
- Icons from lucide-react

**Cards & Surfaces**
- Market tiles: elevated surface with status badges (Bonding/Warmup/Perps)
- Progress rings for graduation metrics
- Mini-canvas placeholders for chart elements
- Glass morphism for overlays

## Page-Specific Layouts

**Dashboard**
- Featured Market card (8 cols): mini-candles, status badge, graduation progress, KPIs
- Create Market card (4 cols): explainer + orange "Launch Market" CTA
- Markets Table (full width): exchange-dense rows with symbol, status, %→graduation, 24h vol, OI, Trade/Buy split buttons

**Launch Wizard**
- 5-step stepper: Basics → Bonding Curve → Graduation Triggers → Perps Params → Fees
- Side-by-side layout: form left, live summary preview right
- Red "Deploy" CTA (urgency), blue ghost secondary buttons
- Real-time preview of market tile with status timeline

**Market Detail (Hyperliquid-inspired)**
- Left 8 cols: chart area with candles/TWAP toggle, tabs for Trades/Funding/Positions
- Right 4 cols: Context-aware trading panel (Bonding/Warmup/Perps modes)
- Optional middle column (xl screens): Order Book + Recent Trades
- Bottom strip: Balances/Open Orders/TWAP/History tabs

**Discover**
- Filterable grid of market tiles
- Status color coding, progress rings, 24h vol, OI
- Filters: Status, Volume, Time

**Creator Dashboard**
- Earnings breakdown from fees
- Launched markets grid
- Referral code generator
- Payout history stub

## Micro-Interactions

**Timing & Motion**
- Standard transitions: 150-200ms ease
- Loading states: skeleton screens
- Hover: subtle glow on interactive elements
- Focus: mint green (#14F195) ring at 35% opacity

**Keyboard Shortcuts**
- Trading ticket: +/− for size, ←/→ for leverage, Enter to submit
- Search: ⌘/Ctrl-K
- Respect prefers-reduced-motion

**Feedback**
- Toast notifications for transactions
- Error lines in red
- Risk/legal footer always visible
- Clear validation states

## Typography Scale

Use system fonts with tight tracking for numbers, slightly looser for text. Establish hierarchy through weight and color contrast rather than excessive size variation.

## Accessibility

- WCAG AA contrast requirements
- ARIA labels on all interactive elements
- Keyboard navigation throughout
- Screen reader friendly status announcements
- Mobile: collapsible rail, bottom sheet trading, dense list tables

## Images

No hero images required. Focus on data visualization, charts, and functional UI elements. Market tiles may include uploaded token/project images (user-provided).