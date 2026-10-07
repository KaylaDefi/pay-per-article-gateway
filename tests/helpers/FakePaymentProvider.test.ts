import { describe, it, expect } from "vitest";
import { FakePaymentProvider, FAKE_TX_HASH } from "./FakePaymentProvider";
import { FacilitatorUnavailableError } from "../../src/services/PaymentVerifier";

describe("FakePaymentProvider", () => {
  it("settles a payment once and rejects a replay", async () => {
    const fake = new FakePaymentProvider();

    const first = await fake.settlePayment("signature-1");
    expect(first.settled).toBe(true);
    expect(first.transactionHash).toBe(FAKE_TX_HASH);

    const replay = await fake.settlePayment("signature-1");
    expect(replay.settled).toBe(false);
  });

  it("throws FacilitatorUnavailableError when unavailable", async () => {
    const fake = new FakePaymentProvider();
    fake.mode = "unavailable";

    await expect(fake.verifyPayment()).rejects.toBeInstanceOf(FacilitatorUnavailableError);
  });
});