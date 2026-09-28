import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import type { TypedDataDefinition } from "viem";
import type { FullArticle } from "./articles";

type SignTypedData = (args: TypedDataDefinition) => Promise<`0x${string}`>;

function readTransactionHash(response: Response): string | undefined {
  const header = response.headers.get("PAYMENT-RESPONSE");
  if (!header) return undefined;
  try {
    return JSON.parse(atob(header)).transaction;
  } catch {
    return undefined;
  }
}

export async function purchaseArticle(
  articleId: string,
  address: `0x${string}`,
  signTypedData: SignTypedData
): Promise<FullArticle> {
  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer: {
      address,
      signTypedData: (args) => signTypedData(args as TypedDataDefinition),
    },
  });

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  const response = await fetchWithPayment(`/articles/${encodeURIComponent(articleId)}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `Purchase failed with status ${response.status}`);
  }

  return { ...(data as FullArticle), transactionHash: readTransactionHash(response) };
}