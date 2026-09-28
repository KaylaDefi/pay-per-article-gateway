import { useState } from "react";
import { WalletConnector } from "./components/WalletConnector";
import { ArticleLibrary } from "./components/ArticleLibrary";
import { ArticlePreview } from "./components/ArticlePreview";
import { ArticleReader } from "./components/ArticleReader";
import type { FullArticle } from "./api/articles";

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<FullArticle | null>(null);

  function backToLibrary() {
    setSelectedId(null);
    setPurchased(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pay-Per-Article News</h1>
        <WalletConnector />
      </header>
      <main>
        {purchased ? (
          <ArticleReader article={purchased} onBack={backToLibrary} />
        ) : selectedId ? (
          <ArticlePreview
            articleId={selectedId}
            onBack={backToLibrary}
            onPurchased={setPurchased}
          />
        ) : (
          <ArticleLibrary onSelect={setSelectedId} />
        )}
      </main>
    </div>
  );
}