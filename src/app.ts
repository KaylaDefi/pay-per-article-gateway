import express, { Request, Response, NextFunction } from "express";
import { ContentRepository } from "./interfaces/ContentRepository";
import { PaymentProvider } from "./interfaces/PaymentProvider";
import { TransactionLogger } from "./services/TransactionLogger";
import { SalesReportGenerator } from "./services/SalesReportGenerator";
import { createPaymentGateway } from "./routes/paymentGateway";
import { createArticleRouter } from "./routes/articles";

export interface AppDependencies {
  articles: ContentRepository;
  payments: PaymentProvider;
  logger: TransactionLogger;
  adminApiKey: string;
}

export function createApp({ articles, payments, logger, adminApiKey }: AppDependencies) {
  const salesReports = new SalesReportGenerator(logger, articles);
  const paymentGateway = createPaymentGateway({ payments, articles, logger });
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/articles", createArticleRouter(articles, paymentGateway));

  app.get("/admin/sales-report", async (req, res) => {
    if (req.header("X-Admin-Key") !== adminApiKey) {
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

  return app;
}