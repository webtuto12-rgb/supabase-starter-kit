import { queryOptions } from "@tanstack/react-query";
import { getStorefront, getPolicies } from "./store.functions";
import type { Category, Product } from "./store";

export type StorefrontData = {
  categories: Category[];
  products: Product[];
  content: { content_key: string; title: string; body: string; data: Record<string, unknown> }[];
};

export const storefrontQuery = queryOptions({
  queryKey: ["storefront"],
  queryFn: async () => (await getStorefront()) as unknown as StorefrontData,
  staleTime: 60_000,
});

export const policiesQuery = queryOptions({
  queryKey: ["policies"],
  queryFn: async () =>
    (await getPolicies()) as { content_key: string; title: string; body: string }[],
  staleTime: 60_000,
});
