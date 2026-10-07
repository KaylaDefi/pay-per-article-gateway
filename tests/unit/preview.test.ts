import { describe, it, expect } from "vitest";
import { WorldNewsArticle } from "../../src/models/WorldNewsArticle";
import { BusinessArticle } from "../../src/models/BusinessArticle";
import { LifestyleArticle } from "../../src/models/LifestyleArticle";

const longBody = "A".repeat(200);

describe("preview()", () => {
  it("tags world news with its region and truncates the body", () => {
    const article = new WorldNewsArticle("wn", "Title", "Author", "0.25", longBody, "West Africa");
    const preview = article.preview();

    expect(preview).toContain("West Africa");
    expect(preview).toContain("A".repeat(120));
    expect(preview).not.toContain(longBody);
  });

  it("tags business articles with a company only when one exists", () => {
    const withCompany = new BusinessArticle("b1", "Title", "Author", "0.50", longBody, "Acme Co.");
    const withoutCompany = new BusinessArticle("b2", "Title", "Author", "0.50", longBody);

    expect(withCompany.preview()).toContain("Acme Co.");
    expect(withoutCompany.preview()).not.toContain("[");
  });

  it("shows lifestyle highlights instead of the body", () => {
    const article = new LifestyleArticle(
      "ls", "Title", "Author", "0.15", longBody, "recipe", ["6 ingredients", "45 minutes"]
    );
    const preview = article.preview();

    expect(preview).toContain("6 ingredients, 45 minutes");
    expect(preview).not.toContain("A".repeat(10));
  });

  it("never repeats the title, since the page shows it separately", () => {
    const article = new WorldNewsArticle("wn", "Unique Headline", "Author", "0.25", longBody, "Asia");
    expect(article.preview()).not.toContain("Unique Headline");
  });
});