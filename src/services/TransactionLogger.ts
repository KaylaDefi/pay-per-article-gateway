import { Transaction } from "../models/Transaction";

export class TransactionLogger {
  private transactions: Transaction[] = [];

  record(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  getAll(): Transaction[] {
    return [...this.transactions];
  }
}