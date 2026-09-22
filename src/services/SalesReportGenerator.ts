import { Transaction, SalesReport, SalesSummary } from "../models/Transaction";
import { ContentRepository } from "../interfaces/ContentRepository";
import { TransactionLogger } from "./TransactionLogger";
import { Article } from "../models/Article";

const USDC_UNITS = 1_000_000;

export class SalesReportGenerator {
  constructor(
    private readonly logger: TransactionLogger,
    private readonly articles: ContentRepository
  ) {}

  async generate(): Promise<SalesReport> {
    const settled = this.logger
      .getAll()
      .filter((t) => t.settlementStatus === "settled");

    const categoryOf = new Map<string, string>();
    for (const t of settled) {
      if (!categoryOf.has(t.articleId)) {
        const item = await this.articles.getById(t.articleId);
        categoryOf.set(
          t.articleId,
          item instanceof Article ? item.category : "uncategorized"
        );
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      byArticle: this.summarize(settled, (t) => t.articleId),
      byCategory: this.summarize(
        settled,
        (t) => categoryOf.get(t.articleId) ?? "uncategorized"
      ),
      byAuthor: this.summarize(settled, (t) => t.author),
    };
  }

  private summarize(
    transactions: Transaction[],
    getKey: (t: Transaction) => string
  ): SalesSummary[] {
    const totals = new Map<string, { units: number; count: number }>();

    for (const t of transactions) {
      const key = getKey(t);
      const current = totals.get(key) ?? { units: 0, count: 0 };
      current.units += Math.round(parseFloat(t.amount) * USDC_UNITS);
      current.count += 1;
      totals.set(key, current);
    }

    return Array.from(totals, ([key, { units, count }]) => ({
      key,
      totalRevenue: (units / USDC_UNITS).toFixed(2),
      purchaseCount: count,
    }));
  }
}