import { ContentRepository, ContentFilters } from "../interfaces/ContentRepository";
import { ContentItem } from "../models/ContentItem";
import { Article } from "../models/Article";

export class ArticleRepository implements ContentRepository {
  private items = new Map<string, ContentItem>();

  async getById(id: string): Promise<ContentItem | undefined> {
    return this.items.get(id);
  }

  async getAll(filters?: ContentFilters): Promise<ContentItem[]> {
    let results = Array.from(this.items.values());

    if (filters?.category) {
      results = results.filter(
        (item) => item instanceof Article && item.category === filters.category
      );
    }

    if (filters?.author) {
      results = results.filter((item) => item.author === filters.author);
    }

    if (filters?.keyword) {
      const terms = filters.keyword.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter((item) => {
        const category = item instanceof Article ? item.category.replace("-", " ") : "";
        const searchable = `${item.title} ${item.author} ${category} ${item.preview()}`.toLowerCase();
        return terms.every((term) => searchable.includes(term));
      });
    }

    return results;
  }

  async save(item: ContentItem): Promise<void> {
    this.items.set(item.id, item);
  }
}