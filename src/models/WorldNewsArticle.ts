import { Article } from "./Article";

export class WorldNewsArticle extends Article {
  constructor(
    id: string,
    title: string,
    author: string,
    price: string,
    body: string,
    public readonly region: string
  ) {
    super(id, title, author, price, "world-news", body);
  }

  preview(): string {
    return `[${this.region}] ${this.title}: ${this.body.slice(0, 120)}...`;
  }
}