export type ArticleCategory = "world-news" | "business" | "lifestyle";

export interface ArticleSummary {
  id: string;
  title: string;
  author: string;
  price: string;
  category?: ArticleCategory;
  preview: string;
}

export interface FullArticle extends ArticleSummary {
  body?: string;
  transactionHash?: string;
}

export interface ArticleFilters {
  category?: string;
  keyword?: string;
  author?: string;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }
  return data as T;
}

export function fetchArticles(filters: ArticleFilters = {}): Promise<ArticleSummary[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return getJson<ArticleSummary[]>(query ? `/articles?${query}` : "/articles");
}

export function fetchPreview(id: string): Promise<ArticleSummary> {
  return getJson<ArticleSummary>(`/articles/${encodeURIComponent(id)}/preview`);
}