import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { cartWhatsappMessage, formatPrice } from "@/lib/store";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — ICT Showroom" },
      {
        name: "description",
        content: "Review your selected ICT products, adjust quantities and continue to checkout.",
      },
      { property: "og:title", content: "Your Cart — ICT Showroom" },
      { property: "og:description", content: "Review your order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, deliveryCharge, total, setQuantity, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShoppingBag className="mx-auto size-12 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add products from the showroom and they will appear here.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Your cart</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border/70 bg-card p-3 sm:p-4"
            >
              <Link
                to="/product/$slug"
                params={{ slug: item.slug }}
                className="size-20 shrink-0 overflow-hidden rounded-xl bg-surface"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-6" aria-hidden="true" />
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: item.slug }}
                  className="line-clamp-2 text-sm font-semibold hover:text-accent"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.price)} each</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" /> Remove
                  </Button>
                </div>
              </div>

              <p className="font-display text-sm font-bold">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-border/70 bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Product subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery charge</dt>
              <dd>{formatPrice(deliveryCharge)}</dd>
            </div>
          </dl>
          <Separator className="my-4" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Total payable</span>
            <span className="font-display text-xl font-extrabold">{formatPrice(total)}</span>
          </div>
          <Button asChild size="lg" className="mt-5 w-full rounded-full">
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <WhatsAppButton
            className="mt-3 w-full"
            message={cartWhatsappMessage(items, subtotal)}
            label="Order this cart on WhatsApp"
          />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Cash on delivery. No account needed.
          </p>
        </aside>
      </div>
    </div>
  );
}
