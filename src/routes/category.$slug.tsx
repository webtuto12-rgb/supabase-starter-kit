import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storefrontQuery } from "@/lib/queries";
import { ProductBrowser } from "@/components/site/ProductBrowser";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(storefrontQuery);
    const category = data.categories.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    return { categoryName: category.category_name, description: category.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category not found" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.categoryName} — ICT Showroom`;
    return {
      meta: [
        { title },
        { name: "description", content: `${loaderData.description}. Cash on delivery island-wide.` },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: CategoryNotFound,
});

function CategoryNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Category not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This category may have been renamed or removed.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/products">Browse all products</Link>
      </Button>
    </div>
  );
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(storefrontQuery);
  const category = data.categories.find((item) => item.slug === slug);
  if (!category) return <CategoryNotFound />;

  const products = data.products.filter((product) => product.category_id === category.id);

  return (
    <div className="py-8">
      <div className="mx-auto mb-6 max-w-7xl px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Showroom
        </Link>
        <h1 className="mt-3 flex items-center gap-3 font-display text-2xl font-extrabold sm:text-3xl">
          <span aria-hidden="true">{category.icon}</span>
          {category.category_name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
      </div>
      <ProductBrowser products={products} categories={data.categories} />
    </div>
  );
}
