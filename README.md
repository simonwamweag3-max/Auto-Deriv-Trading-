# Deriv Digit Trading Engine

React + Node.js multi-user dashboard foundation for Deriv synthetic-index digit strategies (Over 3 / Under 6).

## Current stage
This branch adds an authenticated multi-user dashboard, isolated Deriv account connections, a 1,000-tick rolling digit analyzer, Over 3 / Under 6 state machines, server-side Deriv WebSocket tick feeds, proposal/buy/settlement handling and persisted risk controls. **Demo-account contracts can be placed; real-account trading remains disabled by default.**

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

## Secure multi-user Deriv integration

This branch now includes:
- Email/password registration and login (bcrypt password hashes; short-lived JWT app sessions).
- Per-user Deriv account connections. Users supply their own Deriv account ID and PAT with the `trade` scope; the server verifies the account via Deriv's OTP endpoint and stores the token using AES-256-GCM encryption.
- Server-side authenticated WebSocket connections using Deriv's short-lived OTP URL; no Deriv token is sent back to the browser.
- Per-user database-owned sessions, 1,000 historical tick warm-up, live tick subscriptions, digit strategy evaluation, proposal/buy calls and contract settlement tracking.
- Contract and event persistence, session risk controls (two consecutive losses / six settled contracts), and isolated account/session ownership checks.
- Real-money trading is disabled by default. The server operator must set `ENABLE_LIVE_TRADING=true`; a user must separately confirm the real-money risk, and the connected account must be a Deriv REAL account.

### Server setup

1. Create a PostgreSQL database and apply `server/db/schema.sql`.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL`, a long random `JWT_SECRET`, a 64-character hex `TOKEN_ENCRYPTION_KEY` (32 random bytes), and a current Deriv App ID from developers.deriv.com.
3. Run `npm install`, then `npm run dev:server` and `npm run dev:client`.
4. Register in the dashboard, connect your own Deriv account ID and a PAT token with `trade` (and `read` for balance display) permission, then create a DEMO session first.

Generate an encryption key with Node.js:
```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The server keeps the app JWT in browser memory only. Deriv PATs are encrypted at rest and never returned by the API. Losing `TOKEN_ENCRYPTION_KEY` makes stored Deriv tokens unrecoverable; back it up securely. Use HTTPS, managed secrets, database backups and a persistent process manager before deployment.

### Important limits

The engine's martingale multiplier is capped at 2 and the number of trades is capped at six per session, with a stop after two consecutive losses. These controls do not guarantee a maximum financial loss: market gaps, latency, contract pricing, disconnections and unsettled positions can still cause losses. Real-money mode remains disabled unless the server owner explicitly enables it. Test only on a Deriv demo account first.

### Runtime architecture note

The current session worker registry runs in one Node.js process. Deploy one server instance for this release. Before running multiple API replicas, move active-session ownership and distributed locks to a shared worker/queue system (for example Redis) so the same session cannot start on two replicas. The GitHub Actions pipeline runs the Node tests and frontend production build; a successful build does not replace live Deriv demo-account integration testing.
