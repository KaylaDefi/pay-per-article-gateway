# The Penny Press

The Penny Press is a pay-per-article news gateway built on the [x402 protocol](https://www.coinbase.com/developer-platform/discover/launches/x402). Readers pay for individual articles with USDC on Base, no subscription required. TypeScript, Express, React, and wagmi, with a full automated test suite.

Built as a CSU Global capstone project (CSC480).

## How It Works

1. A reader opens an article and the gateway responds with **HTTP 402 Payment Required**, listing the price.
2. The reader's wallet signs a gasless **EIP-3009** USDC authorization.
3. An x402 facilitator verifies and settles the payment on Base, and the gateway delivers the article with a link to the on-chain transaction.

Wallets that already own an article can read it again without a second charge.

## Tech Stack

- **Server:** TypeScript, Node.js, Express
- **Client:** React, Vite, wagmi, viem, x402 client libraries
- **Payments:** x402 v2, USDC on Base Sepolia (testnet)
- **Testing:** Vitest, supertest

## Getting Started

Requires Node.js 18 or newer.

```bash
# Server (project root)
npm install
cp .env.example .env   # then fill in your values
npm run dev

# Client (second terminal)
cd client
npm install
npm run dev
```

Open http://localhost:5173 and connect a browser wallet on Base Sepolia. Test USDC is available from Circle's faucet.

## Testing

```bash
npm test                   # unit, API, and offline integration tests
npm run test:integration   # also calls the real x402.org facilitator
```

## Project Structure

```
src/        Express gateway: interfaces, models,      services, repositories, routes
client/     React frontend
tests/      Unit, API, and integration tests
docs/       Mermaid source for the class, state, and Gantt diagrams
```