import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchArticles, CATEGORY_LABELS, type ArticleFilters } from "../api/articles";

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
    <section>
      <div className="filters">
        <div className="tabs" role="group" aria-label="Category">
          <button
            className="tab"
            aria-pressed={!filters.category}
            onClick={() => updateFilter("category", "")}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <button
              key={value}
              className={`tab tab--${value}`}
              aria-pressed={filters.category === value}
              onClick={() => updateFilter("category", value)}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          aria-label="Search articles"
          placeholder="Search by title, author, or topic"
          value={filters.keyword ?? ""}
          onChange={(e) => updateFilter("keyword", e.target.value)}
        />
      </div>

      {isLoading && <p className="hint">Loading articles...</p>}
      {error && <p className="error">{error.message}</p>}
      {articles?.length === 0 && (
        <p className="hint">No articles match. Try another category or clear the search.</p>
      )}

      <ul className="article-list">
        {articles?.map((article) => (
          <li key={article.id} className="article-row">
            <div className="row-text">
              {article.category && (
                <span className={`category category--${article.category}`}>
                  {CATEGORY_LABELS[article.category]}
                </span>
              )}
              <h2>
                <button className="row-link" onClick={() => onSelect(article.id)}>
                  {article.title}
                </button>
              </h2>
              <p className="byline">By {article.author}</p>
              <p className="row-preview">{article.preview}</p>
            </div>
            <span className="stub">
              <span className="stub-price">${article.price}</span>
              <span className="stub-unit">USDC</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}