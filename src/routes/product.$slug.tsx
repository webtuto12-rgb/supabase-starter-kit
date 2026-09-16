import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, ImageIcon, Minus, Plus, ShoppingCart, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { storefrontQuery } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useCart } from "@/lib/cart";
import {
  discountPercent,
  effectivePrice,
  formatPrice,
  productWhatsappMessage,
} from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(storefrontQuery);
    const product = data.products.find((item) => item.slug === params.slug);
    if (!product) throw notFound();
    return {
      name: product.product_name,
      description: product.description.slice(0, 155),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} — ICT Showroom`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This item may be out of our catalogue now.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/products">Browse all products</Link>
      </Button>
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(storefrontQuery);
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = data.products.find((item) => item.slug === slug);
  if (!product) return <ProductNotFound />;

  const category = data.categories.find((item) => item.id === product.category_id);
  const related = data.products
    .filter((item) => item.category_id === product.category_id && item.id !== product.id)
    .slice(0, 4);
  const off = discountPercent(product);
  const inStock = product.stock > 0;
  const specs = Object.entries(product.specifications ?? {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-5 text-sm text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        {category && (
          <>
            {" / "}
            <Link
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="hover:text-foreground"
            >
              {category.category_name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground">
              <ImageIcon className="size-16" aria-hidden="true" />
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand} {product.model && `• ${product.model}`}
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
            {product.product_name}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold">
              {formatPrice(effectivePrice(product))}
            </span>
            {off !== null && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                  Save {off}%
                </span>
              </>
            )}
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm">
            {inStock ? (
              <>
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                <span className="text-success">In stock — {product.stock} available</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-destructive" aria-hidden="true" />
                <span className="text-destructive">Currently out of stock</span>
              </>
            )}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border bg-surface">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Increase quantity"
                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 rounded-full"
              disabled={!inStock}
              onClick={() => {
                add(product, quantity);
                toast.success("Added to cart", { description: product.product_name });
              }}
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
              Add to cart
            </Button>
          </div>

          <WhatsAppButton
            className="mt-3 w-full"
            message={productWhatsappMessage(product, quantity)}
          />

          {specs.length > 0 && (
            <>
              <Separator className="my-7" />
              <h2 className="font-display text-lg font-bold">Specifications</h2>
              <dl className="mt-3 divide-y divide-border/70 text-sm">
                {specs.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 py-2">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="text-right font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
