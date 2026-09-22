import { Article } from "./Article";

export class BusinessArticle extends Article {
  constructor(
    id: string,
    title: string,
    author: string,
    price: string,
    body: string,
    public readonly relatedCompany?: string
  ) {
    super(id, title, author, price, "business", body);
  }

  preview(): string {
    const tag = this.relatedCompany ? `[${this.relatedCompany}] ` : "";
    return `${tag}${this.title}: ${this.body.slice(0, 120)}...`;
  }
}