import { ContentItem } from "../models/ContentItem";

export interface PaymentRequirements {
  scheme: "exact";
  network: string;
  amount: string;
  asset: string;
  payTo: string;
  resource: string;
  description: string;
  maxTimeoutSeconds: number;
  extra: { name: string; version: string };
}

export interface VerificationResult {
  isValid: boolean;
  payer?: string;
  reason?: string;
}

export interface SettlementResult {
  settled: boolean;
  transactionHash?: string;
  payer?: string;
  reason?: string;
}

export interface PaymentProvider {
  getPaymentRequirements(
    article: ContentItem,
    resourceUrl: string
  ): Promise<PaymentRequirements>;
  verifyPayment(
    paymentHeader: string,
    requirements: PaymentRequirements
  ): Promise<VerificationResult>;
  settlePayment(
    paymentHeader: string,
    requirements: PaymentRequirements
  ): Promise<SettlementResult>;
}