import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { ArticleRepository } from "./repositories/ArticleRepository";
import { TransactionLogger } from "./services/TransactionLogger";
import { PaymentVerifier } from "./services/PaymentVerifier";
import { SalesReportGenerator } from "./services/SalesReportGenerator";
import { createPaymentGateway } from "./routes/paymentGateway";
import { createArticleRouter } from "./routes/articles";
import { seedArticles } from "./data/seedArticles";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const config = {
    port: Number(process.env.PORT ?? 3000),
    adminApiKey: requireEnv("ADMIN_API_KEY"),
    payments: {
      facilitatorUrl: requireEnv("FACILITATOR_URL"),
      payToAddress: requireEnv("PAY_TO_ADDRESS"),
      network: requireEnv("NETWORK"),
      usdcAddress: requireEnv("USDC_ADDRESS"),
      usdcName: requireEnv("USDC_NAME"),
      usdcVersion: requireEnv("USDC_VERSION"),
    },
  };

  const articles = new ArticleRepository();
  await seedArticles(articles);

  const logger = new TransactionLogger();
  const payments = new PaymentVerifier(config.payments);
  const salesReports = new SalesReportGenerator(logger, articles);
  const paymentGateway = createPaymentGateway({ payments, articles, logger });

  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/articles", createArticleRouter(articles, paymentGateway));

  app.get("/admin/sales-report", async (req, res) => {
    if (req.header("X-Admin-Key") !== config.adminApiKey) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    res.json(await salesReports.generate());
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  });

  app.listen(config.port, () => {
    console.log(`Gateway listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});