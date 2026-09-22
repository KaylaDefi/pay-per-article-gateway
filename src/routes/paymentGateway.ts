import { Request, Response, NextFunction, RequestHandler } from "express";
import { PaymentProvider, PaymentRequirements } from "../interfaces/PaymentProvider";
import { ContentRepository } from "../interfaces/ContentRepository";
import { TransactionLogger } from "../services/TransactionLogger";
import { FacilitatorUnavailableError } from "../services/PaymentVerifier";

const RETRY_AFTER_SECONDS = 30;

interface GatewayDependencies {
  payments: PaymentProvider;
  articles: ContentRepository;
  logger: TransactionLogger;
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}

function sendPaymentRequired(
  res: Response,
  requirements: PaymentRequirements,
  error?: string
): void {
  const paymentRequired = { x402Version: 2, error, accepts: [requirements] };
  res
    .status(402)
    .set("PAYMENT-REQUIRED", encode(paymentRequired))
    .json(paymentRequired);
}

export function createPaymentGateway({
  payments,
  articles,
  logger,
}: GatewayDependencies): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Requested
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ error: "invalid article id" });
        return;
      }

      const article = await articles.getById(id);
      if (!article) {
        res.status(404).json({ error: "article not found" });
        return;
      }

      const resourceUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      const requirements = await payments.getPaymentRequirements(article, resourceUrl);

      // PaymentRequired
      const paymentHeader = req.header("PAYMENT-SIGNATURE");
      if (!paymentHeader) {
        sendPaymentRequired(res, requirements);
        return;
      }

      // PaymentPending -> Verified or Rejected
      const verification = await payments.verifyPayment(paymentHeader, requirements);
      if (!verification.isValid) {
        sendPaymentRequired(res, requirements, verification.reason ?? "payment invalid");
        return;
      }

      // Verified -> Delivered or Rejected
      const settlement = await payments.settlePayment(paymentHeader, requirements);
      logger.record({
        articleId: article.id,
        author: article.author,
        buyerWalletAddress: settlement.payer ?? verification.payer ?? "unknown",
        amount: article.price,
        timestamp: new Date().toISOString(),
        settlementStatus: settlement.settled ? "settled" : "failed",
        transactionHash: settlement.transactionHash,
      });

      if (!settlement.settled) {
        sendPaymentRequired(res, requirements, settlement.reason ?? "settlement failed");
        return;
      }

      res.set(
        "PAYMENT-RESPONSE",
        encode({
          success: true,
          transaction: settlement.transactionHash,
          network: requirements.network,
          payer: settlement.payer,
        })
      );
      res.locals.article = article;
      next();
    } catch (err) {
      if (err instanceof FacilitatorUnavailableError) {
        res
          .status(503)
          .set("Retry-After", String(RETRY_AFTER_SECONDS))
          .json({ error: err.message, retryAfter: RETRY_AFTER_SECONDS });
        return;
      }
      next(err);
    }
  };
}