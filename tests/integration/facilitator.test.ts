import "dotenv/config";
import { describe, it, expect } from "vitest";
import { PaymentVerifier, FacilitatorUnavailableError } from "../../src/services/PaymentVerifier";
import { WorldNewsArticle } from "../../src/models/WorldNewsArticle";

const UNREACHABLE_URL = "http://127.0.0.1:9";
const RESOURCE_URL = "http://localhost:3000/articles/wn-001";

const article = new WorldNewsArticle(
  "wn-001", "Test Article", "Test Author", "0.25", "Test body.", "Test Region"
);

function makeVerifier(facilitatorUrl: string) {
  return new PaymentVerifier({
    facilitatorUrl,
    payToAddress: process.env.PAY_TO_ADDRESS ?? "0x000000000000000000000000000000000000beef",
    network: "eip155:84532",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    usdcName: "USDC",
    usdcVersion: "2",
  });
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}

describe("PaymentVerifier without the network", () => {
  it("rejects a malformed header before contacting the facilitator", async () => {
    const verifier = makeVerifier(UNREACHABLE_URL);
    const requirements = await verifier.getPaymentRequirements(article, RESOURCE_URL);

    const result = await verifier.verifyPayment("not-a-payment", requirements);
    expect(result).toEqual({ isValid: false, reason: "malformed payment header" });
  });

  it("throws FacilitatorUnavailableError when the facilitator cannot be reached", async () => {
    const verifier = makeVerifier(UNREACHABLE_URL);
    const requirements = await verifier.getPaymentRequirements(article, RESOURCE_URL);

    await expect(
      verifier.verifyPayment(encode({ x402Version: 2 }), requirements)
    ).rejects.toBeInstanceOf(FacilitatorUnavailableError);
  });
});

describe.skipIf(!process.env.RUN_INTEGRATION)("PaymentVerifier with the real facilitator", () => {
  const facilitatorUrl = process.env.FACILITATOR_URL ?? "https://x402.org/facilitator";

  it("reaches the facilitator and rejects an unsigned payment", async () => {
    const verifier = makeVerifier(facilitatorUrl);
    const requirements = await verifier.getPaymentRequirements(article, RESOURCE_URL);

    const unsignedPayment = {
      x402Version: 2,
      payload: {
        authorization: {
          from: "0x000000000000000000000000000000000000b0b0",
          to: requirements.payTo,
          value: requirements.amount,
          validAfter: "0",
          validBefore: String(Math.floor(Date.now() / 1000) + 60),
          nonce: "0x" + "00".repeat(32),
        },
        signature: "0x" + "00".repeat(65),
      },
      accepted: requirements,
    };

    const result = await verifier.verifyPayment(encode(unsignedPayment), requirements);
    expect(result.isValid).toBe(false);
  }, 15_000);
});