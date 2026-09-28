import { useChains } from "wagmi";
import type { FullArticle } from "../api/articles";

interface ArticleReaderProps {
  article: FullArticle;
  onBack: () => void;
}

export function ArticleReader({ article, onBack }: ArticleReaderProps) {
  const [targetChain] = useChains();
  const explorerUrl = targetChain.blockExplorers?.default.url;

  return (
    <article className="reader">
      <button className="back" onClick={onBack}>
        ← Back to library
      </button>
      <h1>{article.title}</h1>
      <p className="byline">{article.author}</p>
      <div className="body">{article.body}</div>

      {article.transactionHash && (
        <p className="receipt">
          Paid ${article.price} USDC.{" "}
          {explorerUrl ? (
            <a
              href={`${explorerUrl}/tx/${article.transactionHash}`}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
          ) : (
            <code>{article.transactionHash}</code>
          )}
        </p>
      )}
    </article>
  );
}