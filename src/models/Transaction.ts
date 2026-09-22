export type SettlementStatus = "pending" | "settled" | "failed";

export interface Transaction {
  articleId: string;
  author: string;
  buyerWalletAddress: string;
  amount: string;
  timestamp: string;
  settlementStatus: SettlementStatus;
  transactionHash?: string;
}

export interface SalesSummary {
  key: string;
  totalRevenue: string;
  purchaseCount: number;
}

export interface SalesReport {
  generatedAt: string;
  byArticle: SalesSummary[];
  byCategory: SalesSummary[];
  byAuthor: SalesSummary[];
}