import { useChains } from "wagmi";
import { CATEGORY_LABELS, type FullArticle } from "../api/articles";

interface ArticleReaderProps {
  article: FullArticle;
  onBack: () => void;
}

function shortenHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export function ArticleReader({ article, onBack }: ArticleReaderProps) {
  const [targetChain] = useChains();
  const explorer = targetChain.blockExplorers?.default;
  const paragraphs = article.body?.split(/\n{2,}/) ?? [];

  return (
    <article className="story">
      <button className="back" onClick={onBack}>
        Back to library
      </button>
      {article.category && (
        <span className={`category category--${article.category}`}>
          {CATEGORY_LABELS[article.category]}
        </span>
      )}
      <h1>{article.title}</h1>
      <p className="byline">By {article.author}</p>

      {article.transactionHash && (
        <aside className="receipt" aria-label="Receipt">
          <dl>
            <dt>Paid</dt>
            <dd>${article.price} USDC</dd>
            <dt>Network</dt>
            <dd>{targetChain.name}</dd>
            <dt>Transaction</dt>
            <dd>
              {explorer ? (
                <a
                  className="hash"
                  href={`${explorer.url}/tx/${article.transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortenHash(article.transactionHash)}
                </a>
              ) : (
                <code className="hash">{article.transactionHash}</code>
              )}
            </dd>
          </dl>
        </aside>
      )}

      <div className="article-body">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}