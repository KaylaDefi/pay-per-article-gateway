import { ContentItem } from "./ContentItem";

export type ArticleCategory = "world-news" | "business" | "lifestyle";

export abstract class Article extends ContentItem {
  constructor(
    id: string,
    title: string,
    author: string,
    price: string,
    public readonly category: ArticleCategory,
    public readonly body: string
  ) {
    super(id, title, author, price);
  }
}