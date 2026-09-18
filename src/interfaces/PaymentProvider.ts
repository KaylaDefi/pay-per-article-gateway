export interface PaymentRequirements {
  price: string;
  currency: "USDC";
  network: string;
  payToAddress: string;
}

export interface VerificationResult {
  isValid: boolean;
  reason?: string;
}

export interface SettlementResult {
  settled: boolean;
  transactionHash?: string;
  reason?: string;
}

export interface PaymentProvider {
  getPaymentRequirements(articleId: string): Promise<PaymentRequirements>;
  verifyPayment(paymentHeader: string): Promise<VerificationResult>;
  settlePayment(paymentHeader: string): Promise<SettlementResult>;
}