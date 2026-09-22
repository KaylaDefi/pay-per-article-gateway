import { ContentItem } from "../models/ContentItem";


export interface ContentFilters {
  category?: string;
  keyword?: string;
  author?: string;
}

export interface ContentRepository {
  getById(id: string): Promise<ContentItem | undefined>;
  getAll(filters?: ContentFilters): Promise<ContentItem[]>;
  save(item: ContentItem): Promise<void>;
}