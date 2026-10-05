import {
  PaymentProvider,
  PaymentRequirements,
  VerificationResult,
  SettlementResult,
} from "../../src/interfaces/PaymentProvider";
import { ContentItem } from "../../src/models/ContentItem";
import { FacilitatorUnavailableError } from "../../src/services/PaymentVerifier";

export type FakeMode = "valid" | "invalid" | "settlement-fails" | "unavailable";

export const BUYER_ADDRESS = "0x000000000000000000000000000000000000b0b0";
export const FAKE_TX_HASH = "0xfa4e000000000000000000000000000000000000000000000000000000000001";

export class FakePaymentProvider implements PaymentProvider {
  mode: FakeMode = "valid";
  private settledHeaders = new Set<string>();

  async getPaymentRequirements(
    article: ContentItem,
    resourceUrl: string
  ): Promise<PaymentRequirements> {
    return {
      scheme: "exact",
      network: "eip155:84532",
      amount: String(Math.round(parseFloat(article.price) * 1_000_000)),
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      payTo: "0x000000000000000000000000000000000000beef",
      resource: resourceUrl,
      description: article.title,
      maxTimeoutSeconds: 60,
      extra: { name: "USDC", version: "2" },
    };
  }

  async verifyPayment(): Promise<VerificationResult> {
    if (this.mode === "unavailable") throw new FacilitatorUnavailableError();
    if (this.mode === "invalid") return { isValid: false, reason: "invalid_signature" };
    return { isValid: true, payer: BUYER_ADDRESS };
  }

  async settlePayment(paymentHeader: string): Promise<SettlementResult> {
    if (this.mode === "unavailable") throw new FacilitatorUnavailableError();

    if (this.mode === "settlement-fails" || this.settledHeaders.has(paymentHeader)) {
      return { settled: false, reason: "authorization_already_used" };
    }

    this.settledHeaders.add(paymentHeader);
    return { settled: true, transactionHash: FAKE_TX_HASH, payer: BUYER_ADDRESS };
  }
}