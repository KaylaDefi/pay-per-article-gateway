import "dotenv/config";
import { createApp } from "./app";
import { ArticleRepository } from "./repositories/ArticleRepository";
import { TransactionLogger } from "./services/TransactionLogger";
import { PaymentVerifier } from "./services/PaymentVerifier";
import { seedArticles } from "./data/seedArticles";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const port = Number(process.env.PORT ?? 3000);

  const articles = new ArticleRepository();
  await seedArticles(articles);

  const app = createApp({
    articles,
    logger: new TransactionLogger(),
    adminApiKey: requireEnv("ADMIN_API_KEY"),
    payments: new PaymentVerifier({
      facilitatorUrl: requireEnv("FACILITATOR_URL"),
      payToAddress: requireEnv("PAY_TO_ADDRESS"),
      network: requireEnv("NETWORK"),
      usdcAddress: requireEnv("USDC_ADDRESS"),
      usdcName: requireEnv("USDC_NAME"),
      usdcVersion: requireEnv("USDC_VERSION"),
    }),
  });

  app.listen(port, () => {
    console.log(`Gateway listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});