import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { storefrontQuery } from "@/lib/queries";
import { ProductBrowser } from "@/components/site/ProductBrowser";

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" && search["q"].length > 0
      ? { q: search["q"].slice(0, 80) }
      : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(storefrontQuery),
  head: () => ({
    meta: [
      { title: "All Products — ICT Showroom" },
      {
        name: "description",
        content:
          "Browse every product in the showroom: laptops, monitors, accessories, networking, printers, gaming, storage, CCTV and office equipment.",
      },
      { property: "og:title", content: "All Products — ICT Showroom" },
      {
        property: "og:description",
        content: "Search and filter the full ICT catalogue by brand, price and specification.",
      },
    ],
  }),
  component: AllProducts,
});

function AllProducts() {
  const { data } = useSuspenseQuery(storefrontQuery);
  const { q } = Route.useSearch();

  return (
    <div className="py-8">
      <div className="mx-auto mb-6 max-w-7xl px-4">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">All products</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search, filter and sort the full ICT catalogue.
        </p>
      </div>
      <ProductBrowser
        products={data.products}
        categories={data.categories}
        initialQuery={q ?? ""}
        showCategoryFilter
      />
    </div>
  );
}
