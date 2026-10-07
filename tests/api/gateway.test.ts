import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import { ArticleRepository } from "../../src/repositories/ArticleRepository";
import { TransactionLogger } from "../../src/services/TransactionLogger";
import { seedArticles } from "../../src/data/seedArticles";
import { FakePaymentProvider, FAKE_TX_HASH, BUYER_ADDRESS } from "../helpers/FakePaymentProvider";

const ADMIN_KEY = "test-admin-key";

function decode(header: string) {
  return JSON.parse(Buffer.from(header, "base64").toString("utf8"));
}

let fake: FakePaymentProvider;
let logger: TransactionLogger;
let app: ReturnType<typeof createApp>;

beforeEach(async () => {
  const articles = new ArticleRepository();
  await seedArticles(articles);
  fake = new FakePaymentProvider();
  logger = new TransactionLogger();
  app = createApp({ articles, payments: fake, logger, adminApiKey: ADMIN_KEY });
});

describe("Test Case 1: Browse and Search Articles", () => {
  it("lists all six articles without bodies", async () => {
    const res = await request(app).get("/articles");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body[0].body).toBeUndefined();
  });

  it("matches title, author, and category in one search", async () => {
    const byTitle = await request(app).get("/articles?keyword=seawalls");
    const byAuthor = await request(app).get("/articles?keyword=okafor");
    const byCategory = await request(app).get("/articles?keyword=business");

    expect(byTitle.body.map((a: { id: string }) => a.id)).toEqual(["wn-001"]);
    expect(byAuthor.body.map((a: { id: string }) => a.id)).toEqual(["wn-001"]);
    expect(byCategory.body.map((a: { id: string }) => a.id)).toEqual(["bz-001", "bz-002"]);
  });

  it("returns an empty list for an unmatched term", async () => {
    const res = await request(app).get("/articles?keyword=zzzz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("Test Case 2: Preview a Locked Article", () => {
  it("returns a teaser without the body", async () => {
    const res = await request(app).get("/articles/ls-001/preview");
    expect(res.status).toBe(200);
    expect(res.body.preview).toBeTruthy();
    expect(res.body.body).toBeUndefined();
  });

  it("returns 404 for a nonexistent article", async () => {
    const res = await request(app).get("/articles/xx-999/preview");
    expect(res.status).toBe(404);
  });
});

describe("Test Case 4: Purchase an Article", () => {
  it("returns 402 with payment requirements when unpaid", async () => {
    const res = await request(app).get("/articles/wn-001");
    expect(res.status).toBe(402);
    const required = decode(res.headers["payment-required"]);
    expect(required.accepts[0].amount).toBe("250000");
  });

  it("delivers the article with a transaction hash after payment", async () => {
    const res = await request(app).get("/articles/wn-001").set("PAYMENT-SIGNATURE", "signature-1");
    expect(res.status).toBe(200);
    expect(res.body.body).toBeTruthy();
    expect(decode(res.headers["payment-response"]).transaction).toBe(FAKE_TX_HASH);
  });

    it("returns 404 for a nonexistent article before asking for payment", async () => {
    const res = await request(app).get("/articles/xx-999").set("PAYMENT-SIGNATURE", "signature-1");
    expect(res.status).toBe(404);
  });
});

describe("Test Case 5: Publisher Sales Report", () => {
  it("rejects requests without the admin key", async () => {
    const res = await request(app).get("/admin/sales-report");
    expect(res.status).toBe(401);
  });

  it("reports one settled purchase by article, category, and author", async () => {
    await request(app).get("/articles/wn-001").set("PAYMENT-SIGNATURE", "signature-1");
    const res = await request(app).get("/admin/sales-report").set("X-Admin-Key", ADMIN_KEY);

    expect(res.body.byArticle).toEqual([{ key: "wn-001", totalRevenue: "0.25", purchaseCount: 1 }]);
    expect(res.body.byCategory[0].key).toBe("world-news");
    expect(res.body.byAuthor[0].key).toBe("Maya Okafor");
    expect(logger.getAll()[0].buyerWalletAddress).toBe(BUYER_ADDRESS);
  });
});

describe("Test Case 6: Failure and Replay Scenarios", () => {
  it("rejects a replayed signature and records only one sale", async () => {
    await request(app).get("/articles/wn-001").set("PAYMENT-SIGNATURE", "signature-1");
    const replay = await request(app).get("/articles/wn-001").set("PAYMENT-SIGNATURE", "signature-1");
    expect(replay.status).toBe(402);

    const report = await request(app).get("/admin/sales-report").set("X-Admin-Key", ADMIN_KEY);
    expect(report.body.byArticle[0].purchaseCount).toBe(1);
  });

  it("returns 402 when the facilitator rejects the payment", async () => {
    fake.mode = "invalid";
    const res = await request(app).get("/articles/wn-001").set("PAYMENT-SIGNATURE", "bad");
    expect(res.status).toBe(402);
    expect(res.body.error).toBe("invalid_signature");
    expect(logger.getAll()).toHaveLength(0);
  });

  it("logs a failed settlement without counting it as revenue", async () => {
    fake.mode = "settlement-fails";
    const res = await request(app).get("/articles/wn-001").set("PAYMENT-SIGNATURE", "signature-1");
    expect(res.status).toBe(402);
    expect(logger.getAll()[0].settlementStatus).toBe("failed");

    const report = await request(app).get("/admin/sales-report").set("X-Admin-Key", ADMIN_KEY);
    expect(report.body.byArticle).toEqual([]);
  });

  it("returns 503 with a retry delay when the facilitator is unavailable", async () => {
    fake.mode = "unavailable";
    const res = await request(app).get("/articles/wn-001").set("PAYMENT-SIGNATURE", "signature-1");
    expect(res.status).toBe(503);
    expect(res.headers["retry-after"]).toBe("30");
    expect(res.body.retryAfter).toBe(30);
  });
});