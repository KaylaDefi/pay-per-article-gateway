import { useQuery, useMutation } from "@tanstack/react-query";
import { useChains, useConnection, useSignTypedData } from "wagmi";
import { fetchPreview, CATEGORY_LABELS, type FullArticle } from "../api/articles";
import { purchaseArticle } from "../api/paidFetch";

interface ArticlePreviewProps {
  articleId: string;
  onBack: () => void;
  onPurchased: (article: FullArticle) => void;
}

export function ArticlePreview({ articleId, onBack, onPurchased }: ArticlePreviewProps) {
  const { address, isConnected, chainId } = useConnection();
  const [targetChain] = useChains();
  const signTypedData = useSignTypedData();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["preview", articleId],
    queryFn: () => fetchPreview(articleId),
  });

  const purchase = useMutation({
    mutationFn: () => purchaseArticle(articleId, address!, signTypedData.mutateAsync),
    onSuccess: onPurchased,
  });

  if (isLoading) return <p>Loading preview...</p>;
  if (error) return <p className="error">{error.message}</p>;
  if (!article) return null;

  const onRightNetwork = chainId === targetChain.id;
  const canPay = isConnected && !!address && onRightNetwork && !purchase.isPending;

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
      <p className="teaser">{article.preview}</p>

      <div className="ticket">
        <div className="ticket-price">
          <strong>${article.price}</strong>
          <span>USDC on {targetChain.name}</span>
        </div>
        <div className="ticket-action">
          <button className="pay" disabled={!canPay} onClick={() => purchase.mutate()}>
            {purchase.isPending ? "Confirm in your wallet" : "Pay to read"}
          </button>
          {!isConnected && <p className="hint">Connect a wallet above to buy this article.</p>}
          {isConnected && !onRightNetwork && (
            <p className="hint">Switch your wallet to {targetChain.name} to pay.</p>
          )}
          {purchase.error && <p className="error">{purchase.error.message}</p>}
        </div>
      </div>
    </article>
  );
}