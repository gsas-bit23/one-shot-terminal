# One Shot (`ONE SHOT Pro`) — Zero-Fee Trading Terminal for Robinhood Chain

**One Shot (`ONE SHOT Pro`)** is a non-custodial, **0.00% fee** spot, launchpad, and perpetuals trading terminal built for **Robinhood Chain Testnet (`Chain ID: 46630`)**.

---

## Key Features

- **8 Core Terminal Hubs + Pro Token Terminal**:
  - **Pulse**: 3-column real-time launchpad feed (`New Pairs`, `Final Stretch`, `Migrated`) with 14 customizable filters, `P1 / P2 / P3` presets, hoverable `𝕏` narrative tweet previews, and 1-click **Migration Sniper** (`🎯 Snipe`).
  - **Discover**: Full-width DEX Screener & Trending table with `5m / 1h / 6h / 24h` metrics and `Audit Log` verification (`Top 10 %`, `LP Burned`, `Paid`).
  - **Token Terminal**: 1-second candlestick chart (`MarketCap / Price` toggle, `DB / DS / B / S` trade bubbles, and draggable **Limit Order Target Line**), live `Trades` stream with **Trader Scan (`🔍`)** popover, and `Market / Limit / Migration Sniper` execution ticket.
  - **Trackers**: Floating **Wallet Tracker** (`Wallet Manager` + `Live Trades •`), **Twitter / X Narrative Monitor**, and **Instant Trade** floating hotkey panel (`Space + 1/2/3/4` to Buy, `Space + Q/W/E/R` to Sell).
  - **Perpetuals**: 50x zero-fee perpetual futures terminal with L2 orderbook and isolated margin controls.
  - **Yield**: Native ETH & USDC vault staking (`15.05% APY`).
  - **Vision**: KOL & Smart Money performance cards + live **Bundle Checker**.
  - **Portfolio & Multi-Wallet**: Spot & Perp PnL analytics, shareable PnL card exporter, and Multi-Wallet splitter.
  - **Rewards**: 3-tier referral tree (`30% L1 / 3% L2 / 2% L3`) and 7-tier multiplier schedule (`Wood` through `Champion`) with **0.00% platform fees**.

---

## On-Chain Architecture (`Robinhood Chain Testnet • 46630`)

- **Network**: Robinhood Chain Testnet (`Chain ID: 46630`)
- **RPC Endpoint**: `https://rpc.testnet.chain.robinhood.com`
- **Block Explorer**: `https://explorer.testnet.chain.robinhood.com`
- **Verified Zero-Fee Router Contract**: [`0x36c34da75352abcd9a4872f791cd00f329487842`](https://explorer.testnet.chain.robinhood.com/address/0x36c34da75352abcd9a4872f791cd00f329487842)

---

## Quick Start

```bash
# Install dependencies (lint: npm run lint, tests: npm test)
npm install

# Start development server on http://localhost:3000
npm run dev

# Build for production
npm run build
```

---

## Routes

`/` landing page · `/pulse` · `/discover` · `/trackers` · `/perps` · `/yield` · `/vision` · `/portfolio` · `/rewards` · `/token/:addr`

## Security notes

- Trades are signed only by the user's connected browser wallet. Rejecting the prompt aborts the trade; there is no shared-wallet fallback.
- Never put private keys in `VITE_*` variables: they are bundled into public client JS.
- The local dev relayer endpoints (`/api/relayer-*`, used for token launch) are **off by default** and only mount under `vite dev` with `ENABLE_DEV_RELAYER=true`. They are unauthenticated: local testnet use only.
- Sections marked **Demo** show simulated data.
