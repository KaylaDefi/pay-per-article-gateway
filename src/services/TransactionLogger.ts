import { Transaction } from "../models/Transaction";
import { TransactionStore } from "../interfaces/TransactionStore";

export class TransactionLogger implements TransactionStore {
  private transactions: Transaction[] = [];

  async record(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
  }

  async getAll(): Promise<Transaction[]> {
    return [...this.transactions];
  }

  async hasPurchased(walletAddress: string, articleId: string): Promise<boolean> {
    const wallet = walletAddress.toLowerCase();
    return this.transactions.some(
      (t) =>
        t.articleId === articleId &&
        t.settlementStatus === "settled" &&
        t.buyerWalletAddress.toLowerCase() === wallet
    );
  }
}