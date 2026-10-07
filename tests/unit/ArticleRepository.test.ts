import { describe, it, expect, beforeEach } from "vitest";
import { ArticleRepository } from "../../src/repositories/ArticleRepository";
import { seedArticles } from "../../src/data/seedArticles";

let repo: ArticleRepository;

beforeEach(async () => {
  repo = new ArticleRepository();
  await seedArticles(repo);
});

describe("ArticleRepository", () => {
  it("finds an article by id and returns undefined for a missing one", async () => {
    expect((await repo.getById("wn-001"))?.title).toContain("Seawalls");
    expect(await repo.getById("xx-999")).toBeUndefined();
  });

  it("returns every article when no filters are given", async () => {
    expect(await repo.getAll()).toHaveLength(6);
  });

  it("filters by category", async () => {
    const results = await repo.getAll({ category: "lifestyle" });
    expect(results.map((a) => a.id)).toEqual(["ls-001", "ls-002"]);
  });

  it("matches every search word across title and author", async () => {
    const results = await repo.getAll({ keyword: "okafor seawalls" });
    expect(results.map((a) => a.id)).toEqual(["wn-001"]);
  });

  it("does not search paid article text beyond the preview", async () => {
    expect(await repo.getAll({ keyword: "decades" })).toEqual([]);
  });
});