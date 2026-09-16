import { Link } from "@tanstack/react-router";
import { ImageIcon, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountPercent, effectivePrice, formatPrice, type Product } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:border-primary/50 hover:shadow-[var(--shadow-glass)]">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/3] overflow-hidden bg-surface"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-10" aria-hidden="true" />
          </span>
        )}
        <span className="absolute left-3 top-3 flex gap-2">
          {off !== null && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground">
              -{off}%
            </span>
          )}
          {product.is_new_arrival && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
              New
            </span>
          )}
        </span>
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-background/85 py-1.5 text-center text-xs font-semibold">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:text-accent"
        >
          {product.product_name}
        </Link>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="font-display text-base font-bold">
            {formatPrice(effectivePrice(product))}
          </span>
          {off !== null && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="mt-2 w-full rounded-full"
          disabled={outOfStock}
          onClick={() => {
            add(product);
            toast.success("Added to cart", { description: product.product_name });
          }}
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
          Add to cart
        </Button>
      </div>
    </article>
  );
}
