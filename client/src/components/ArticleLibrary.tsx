import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchArticles, type ArticleFilters } from "../api/articles";

const CATEGORY_LABELS: Record<string, string> = {
  "world-news": "World News",
  business: "Business",
  lifestyle: "Lifestyle",
};

interface ArticleLibraryProps {
  onSelect: (id: string) => void;
}

export function ArticleLibrary({ onSelect }: ArticleLibraryProps) {
  const [filters, setFilters] = useState<ArticleFilters>({});

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["articles", filters],
    queryFn: () => fetchArticles(filters),
    placeholderData: keepPreviousData,
  });

  function updateFilter(key: keyof ArticleFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  }

  return (
    <section className="library">
      <div className="filters">
        <select
          value={filters.category ?? ""}
          onChange={(e) => updateFilter("category", e.target.value)}
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search titles"
          value={filters.keyword ?? ""}
          onChange={(e) => updateFilter("keyword", e.target.value)}
        />
        <input
          type="search"
          placeholder="Author"
          value={filters.author ?? ""}
          onChange={(e) => updateFilter("author", e.target.value)}
        />
      </div>

      {isLoading && <p>Loading articles...</p>}
      {error && <p className="error">{error.message}</p>}
      {articles && articles.length === 0 && <p>No articles match these filters.</p>}

      <div className="article-grid">
        {articles?.map((article) => (
          <button
            key={article.id}
            className="article-card"
            onClick={() => onSelect(article.id)}
          >
            <span className="category">
              {article.category ? CATEGORY_LABELS[article.category] : "Article"}
            </span>
            <h2>{article.title}</h2>
            <p className="byline">
              {article.author} · ${article.price} USDC
            </p>
            <p className="preview">{article.preview}</p>
          </button>
        ))}
      </div>
    </section>
  );
}