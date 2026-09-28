import { Article } from "./Article";

export type LifestyleSubtype = "recipe" | "travel" | "review";

export class LifestyleArticle extends Article {
  constructor(
    id: string,
    title: string,
    author: string,
    price: string,
    body: string,
    public readonly subtype: LifestyleSubtype,
    public readonly highlights: string[]
  ) {
    super(id, title, author, price, "lifestyle", body);
  }

  preview(): string {
    return `$ (${this.subtype}): ${this.highlights.join(", ")}`;
  }
}