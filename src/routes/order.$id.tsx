import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getOrder } from "@/lib/store.functions";
import { formatPrice, type Order, type OrderItem } from "@/lib/store";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Confirmation — ICT Showroom" },
      { name: "description", content: "Your order confirmation and receipt." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Order Confirmation — ICT Showroom" },
      { property: "og:description", content: "Your order has been received." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await fetchOrder({ data: { id } })) as Order | null,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This confirmation link may be incorrect or expired.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/products">Back to shopping</Link>
        </Button>
      </div>
    );
  }

  const items = (data.products ?? []) as OrderItem[];
  const whatsappMessage = [
    `Hello, about my order #${data.order_number}`,
    "",
    ...items.map((item) => `${item.name} x ${item.quantity}`),
    "",
    `Total: ${formatPrice(Number(data.total))}`,
    `Name: ${data.customer_name}`,
    `Phone: ${data.phone}`,
    `Address: ${data.address}`,
  ].join("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-10">
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">
            Thank you for your order 🎉
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your order has been successfully received. We will contact you shortly to confirm.
          </p>
          <p className="mt-5 inline-block rounded-full bg-surface px-5 py-2 font-display text-lg font-bold">
            Order #{data.order_number}
          </p>
        </div>

        <Separator className="my-7" />

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold">Customer details</h2>
            <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div>Name: {data.customer_name}</div>
              <div>Phone: {data.phone}</div>
              {data.email && <div>Email: {data.email}</div>}
              <div>
                Address: {data.address}
                {data.city ? `, ${data.city}` : ""}
              </div>
              {data.notes && <div>Notes: {data.notes}</div>}
            </dl>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Payment & delivery</h2>
            <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div>Payment method: {data.payment_method}</div>
              <div>Delivery charge: {formatPrice(Number(data.delivery_charge))}</div>
              <div>Placed: {new Date(data.created_at).toLocaleDateString("en-LK")}</div>
            </dl>
          </div>
        </div>

        <Separator className="my-7" />

        <h2 className="text-sm font-semibold">Products</h2>
        <ul className="mt-3 divide-y divide-border/70 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-2.5">
              <span className="min-w-0">
                <span className="line-clamp-2">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatPrice(item.price)} x {item.quantity}
                </span>
              </span>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <Separator className="my-5" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Product Total</dt>
            <dd>{formatPrice(Number(data.subtotal))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>{formatPrice(Number(data.delivery_charge))}</dd>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <dt className="font-semibold">Total Amount</dt>
            <dd className="font-display text-xl font-extrabold">
              {formatPrice(Number(data.total))}
            </dd>
          </div>
        </dl>

        <div className="no-print mt-8 flex flex-wrap gap-3">
          <Button className="rounded-full" onClick={() => window.print()}>
            <Download className="size-4" aria-hidden="true" />
            Download PDF receipt
          </Button>
          <WhatsAppButton message={whatsappMessage} label="Message us about this order" />
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
