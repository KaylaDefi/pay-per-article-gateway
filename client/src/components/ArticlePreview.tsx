import { useQuery, useMutation } from "@tanstack/react-query";
import { useChains, useConnection, useSignTypedData } from "wagmi";
import { fetchPreview, type FullArticle } from "../api/articles";
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
    <article className="preview-page">
      <button className="back" onClick={onBack}>
        ← Back to library
      </button>
      <h1>{article.title}</h1>
      <p className="byline">{article.author}</p>
      <p className="preview locked">{article.preview}</p>

      <button className="pay" disabled={!canPay} onClick={() => purchase.mutate()}>
        {purchase.isPending ? "Confirm in your wallet..." : `Pay $${article.price} to Read`}
      </button>

      {!isConnected && <p className="hint">Connect a wallet to purchase this article.</p>}
      {isConnected && !onRightNetwork && (
        <p className="hint">Switch your wallet to {targetChain.name} to purchase.</p>
      )}
      {purchase.error && <p className="error">{purchase.error.message}</p>}
    </article>
  );
}