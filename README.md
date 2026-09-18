# Pay-Per-Article Gateway

A pay-per-article news access gateway built on the [x402 protocol](https://www.coinbase.com/developer-platform/discover/launches/x402), letting a demonstration publisher sell individual articles across categories using instant USDC micropayments instead of subscriptions.


## Tech Stack

- TypeScript / Node.js / Express
- x402 protocol (USDC on Base)
- EIP-3009 (gasless payment authorization)


## Getting Started

```bash
npm install
npm run dev
```

Requires a `.env` file  with your facilitator URL and payout wallet address — see `.env.example` for the expected format.

## Status

Actively under development. See `docs/class-diagram.mmd` for the system's UML class diagram.