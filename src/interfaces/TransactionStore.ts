import { Transaction } from "../models/Transaction";

export interface TransactionStore {
  record(transaction: Transaction): Promise<void>;
  getAll(): Promise<Transaction[]>;
  hasPurchased(walletAddress: string, articleId: string): Promise<boolean>;
}