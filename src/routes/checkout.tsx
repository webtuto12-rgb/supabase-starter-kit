import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Wallet } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { cartWhatsappMessage, formatPrice } from "@/lib/store";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { createOrder } from "@/lib/store.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ICT Showroom" },
      {
        name: "description",
        content:
          "Place your order in under a minute. No account needed, cash on delivery, flat LKR 500 delivery charge.",
      },
      { property: "og:title", content: "Checkout — ICT Showroom" },
      { property: "og:description", content: "Fast checkout with cash on delivery." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\s-]+$/, "Phone number can only contain numbers"),
  email: z.string().trim().email("Please enter a valid email address").max(255).or(z.literal("")),
  address: z.string().trim().min(5, "Please enter your delivery address").max(500),
  city: z.string().trim().max(100),
  notes: z.string().trim().max(1000),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  customer_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
};

function CheckoutPage() {
  const { items, subtotal, deliveryCharge, total, clear } = useCart();
  const navigate = useNavigate();
  const submitOrder = useServerFn(createOrder);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await submitOrder({
        data: {
          ...parsed.data,
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        },
      });
      clear();
      navigate({ to: "/order/$id", params: { id: result.id } });
    } catch (error) {
      console.error(error);
      toast.error("We couldn't place your order", {
        description: "Please check your details and try again, or order on WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a product before going to checkout.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No account needed — just your delivery details.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
          <div>
            <Label htmlFor="customer_name">Full name *</Label>
            <Input
              id="customer_name"
              value={values.customer_name}
              onChange={(event) => update("customer_name", event.target.value)}
              maxLength={100}
              className="mt-1.5"
              autoComplete="name"
            />
            {errors.customer_name && (
              <p className="mt-1 text-xs text-destructive">{errors.customer_name}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone number *</Label>
              <Input
                id="phone"
                value={values.phone}
                onChange={(event) => update("phone", event.target.value)}
                maxLength={20}
                inputMode="tel"
                className="mt-1.5"
                autoComplete="tel"
                placeholder="07X XXX XXXX"
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(event) => update("email", event.target.value)}
                maxLength={255}
                className="mt-1.5"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Delivery address *</Label>
            <Textarea
              id="address"
              value={values.address}
              onChange={(event) => update("address", event.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1.5"
              autoComplete="street-address"
            />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={values.city}
              onChange={(event) => update("city", event.target.value)}
              maxLength={100}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="notes">Order notes</Label>
            <Textarea
              id="notes"
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-1.5"
              placeholder="Landmark, preferred delivery time, anything else we should know"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface p-4">
            <Wallet className="size-5 text-accent" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">
                Pay the courier when your order arrives.
              </p>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border/70 bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="min-w-0 text-muted-foreground">
                  <span className="line-clamp-1">{item.name}</span>
                  <span className="text-xs">x {item.quantity}</span>
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Product Total</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{formatPrice(deliveryCharge)}</dd>
            </div>
          </dl>
          <Separator className="my-4" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Final Total</span>
            <span className="font-display text-xl font-extrabold">{formatPrice(total)}</span>
          </div>

          <Button type="submit" size="lg" className="mt-5 w-full rounded-full" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Place order
          </Button>
          <WhatsAppButton
            className="mt-3 w-full"
            label="Order on WhatsApp instead"
            message={cartWhatsappMessage(items, subtotal, {
              name: values.customer_name,
              phone: values.phone,
              address: values.address,
            })}
          />
        </aside>
      </form>
    </div>
  );
}
