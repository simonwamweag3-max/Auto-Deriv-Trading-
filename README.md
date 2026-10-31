# Deriv Digit Trading Engine

React + Node.js multi-user dashboard foundation for Deriv synthetic-index digit strategies (Over 3 / Under 6).

## Current stage
This branch adds an isolated per-user bot engine, 1,000-tick rolling digit analyzer, Over 3 / Under 6 state machines, risk controls, demo feed, API routes and dashboard scaffold. **Demo mode only: no real orders are sent.**

## Synthetic-index coverage
The market selector includes a broad fallback catalogue and can discover the currently active synthetic-index symbols directly from Deriv using the public `active_symbols` WebSocket request. Set `VITE_DERIV_APP_ID` in the client environment to enable live discovery. The live API catalogue is authoritative and automatically includes newly listed synthetic markets; the fallback list is provided for offline/demo use. The selector includes Volatility (standard and 1-second), Crash, Boom, Jump, Step, Range Break, Drift Switching, DEX and derived-market entries where supported by the API.

## Run
- Node.js 20+
- Copy `.env.example` to `.env`
- `npm install`
- `npm run dev:server`
- In another terminal: `npm run dev:client`
- API: http://localhost:4000; UI: http://localhost:5173

## Safety
Live trading is intentionally disabled. Before activation, implement and test Deriv authorization, proposal/buy/settlement, duplicate-order protection, account-level risk enforcement, token custody, audit trails and explicit user consent. Never commit API tokens.

## Rule interpretations requiring confirmation
- Red = unique lowest frequency across all ten digits; tied minimum blocks entry.
- Yellow = unique second-lowest frequency; tied second place blocks special-case entry.
- Under 6's "extreme baseline" means the lowest-frequency digit in 6–9.
- Frequencies use the current sample count during warm-up and 1,000 once full.
- Spike means the latest tick changes that digit's frequency by at least 0.1 percentage points.
