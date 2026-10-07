import { describe, it, expect, beforeEach } from "vitest";
import { SalesReportGenerator } from "../../src/services/SalesReportGenerator";
import { TransactionLogger } from "../../src/services/TransactionLogger";
import { ArticleRepository } from "../../src/repositories/ArticleRepository";
import { seedArticles } from "../../src/data/seedArticles";
import type { Transaction } from "../../src/models/Transaction";

function sale(articleId: string, author: string, amount: string, status: Transaction["settlementStatus"] = "settled"): Transaction {
  return {
    articleId,
    author,
    amount,
    buyerWalletAddress: "0xbuyer",
    timestamp: new Date().toISOString(),
    settlementStatus: status,
  };
}

let logger: TransactionLogger;
let generator: SalesReportGenerator;

beforeEach(async () => {
  const repo = new ArticleRepository();
  await seedArticles(repo);
  logger = new TransactionLogger();
  generator = new SalesReportGenerator(logger, repo);
});

describe("SalesReportGenerator", () => {
  it("counts only settled transactions", async () => {
    logger.record(sale("wn-001", "Maya Okafor", "0.25"));
    logger.record(sale("wn-001", "Maya Okafor", "0.25", "failed"));

    const report = await generator.generate();
    expect(report.byArticle).toEqual([{ key: "wn-001", totalRevenue: "0.25", purchaseCount: 1 }]);
  });

  it("adds currency without floating-point drift", async () => {
    logger.record(sale("ls-001", "Hannah Wells", "0.10"));
    logger.record(sale("ls-001", "Hannah Wells", "0.10"));
    logger.record(sale("ls-001", "Hannah Wells", "0.10"));

    const report = await generator.generate();
    expect(report.byArticle[0].totalRevenue).toBe("0.30");
  });

  it("groups revenue by category using the repository", async () => {
    logger.record(sale("bz-001", "Priya Raman", "0.50"));
    logger.record(sale("bz-002", "Daniel Ortiz", "0.50"));

    const report = await generator.generate();
    expect(report.byCategory).toEqual([{ key: "business", totalRevenue: "1.00", purchaseCount: 2 }]);
  });

  it("labels sales of removed articles as uncategorized instead of failing", async () => {
    logger.record(sale("gone-001", "Former Writer", "0.25"));

    const report = await generator.generate();
    expect(report.byCategory[0].key).toBe("uncategorized");
  });
});