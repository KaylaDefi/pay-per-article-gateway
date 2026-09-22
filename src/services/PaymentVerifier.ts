import {
  PaymentProvider,
  PaymentRequirements,
  VerificationResult,
  SettlementResult,
} from "../interfaces/PaymentProvider";
import { ContentItem } from "../models/ContentItem";

const USDC_UNITS = 1_000_000;
const FACILITATOR_TIMEOUT_MS = 10_000;

export class FacilitatorUnavailableError extends Error {
  constructor() {
    super("payment service temporarily unavailable");
  }
}

export interface PaymentVerifierConfig {
  facilitatorUrl: string;
  payToAddress: string;
  network: string;
  usdcAddress: string;
  usdcName: string;
  usdcVersion: string;
}

interface FacilitatorVerifyResponse {
  isValid: boolean;
  invalidReason?: string;
  payer?: string;
}

interface FacilitatorSettleResponse {
  success: boolean;
  transaction?: string;
  payer?: string;
  errorReason?: string;
}

export class PaymentVerifier implements PaymentProvider {
  constructor(private readonly config: PaymentVerifierConfig) {}

  async getPaymentRequirements(
    article: ContentItem,
    resourceUrl: string
  ): Promise<PaymentRequirements> {
    return {
      scheme: "exact",
      network: this.config.network,
      maxAmountRequired: String(
        Math.round(parseFloat(article.price) * USDC_UNITS)
      ),
      asset: this.config.usdcAddress,
      payTo: this.config.payToAddress,
      resource: resourceUrl,
      description: article.title,
      maxTimeoutSeconds: 60,
      extra: { name: this.config.usdcName, version: this.config.usdcVersion },
    };
  }

  /**
   * Asks the facilitator to check the signed EIP-3009 authorization
   * (signature, payer balance, nonce, expiry) against the requirements.
   * No funds move on-chain during verification.
   */

  async verifyPayment(
    paymentHeader: string,
    requirements: PaymentRequirements
  ): Promise<VerificationResult> {
    const payload = this.decodeHeader(paymentHeader);
    if (!payload) {
      return { isValid: false, reason: "malformed payment header" };
    }

    const data = await this.callFacilitator<FacilitatorVerifyResponse>(
      "/verify",
      payload,
      requirements
    );
    return { isValid: data.isValid === true, payer: data.payer, reason: data.invalidReason };
  }

   /**
   * Asks the facilitator to submit the authorized USDC transfer to the
   * blockchain. The facilitator pays gas, waits for confirmation, and
   * returns the on-chain transaction hash.
   */

  async settlePayment(
    paymentHeader: string,
    requirements: PaymentRequirements
  ): Promise<SettlementResult> {
    const payload = this.decodeHeader(paymentHeader);
    if (!payload) {
      return { settled: false, reason: "malformed payment header" };
    }

    const data = await this.callFacilitator<FacilitatorSettleResponse>(
      "/settle",
      payload,
      requirements
    );
    return {
      settled: data.success === true,
      transactionHash: data.transaction,
      payer: data.payer,
      reason: data.errorReason,
    };
  }

  private decodeHeader(header: string): unknown | null {
    try {
      return JSON.parse(Buffer.from(header, "base64").toString("utf8"));
    } catch {
      return null;
    }
  }

  private async callFacilitator<T>(
    path: string,
    paymentPayload: unknown,
    paymentRequirements: PaymentRequirements
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.config.facilitatorUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x402Version: 2, paymentPayload, paymentRequirements }),
        signal: AbortSignal.timeout(FACILITATOR_TIMEOUT_MS),
      });
    } catch {
      throw new FacilitatorUnavailableError();
    }

    if (response.status >= 500) {
      throw new FacilitatorUnavailableError();
    }
    return (await response.json()) as T;
  }
}