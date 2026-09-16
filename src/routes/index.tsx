import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Headphones, Star, Truck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storefrontQuery } from "@/lib/queries";
import { CategoryShowroom } from "@/components/site/CategoryShowroom";
import { HeroEntry } from "@/components/site/HeroEntry";
import { ProductCard } from "@/components/site/ProductCard";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { DELIVERY_CHARGE, formatPrice, type Product } from "@/lib/store";
import heroImage from "@/assets/hero-showroom.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(storefrontQuery),
  head: () => ({
    meta: [
      { title: "ICT Showroom — Laptops, Monitors, Printers & More" },
      {
        name: "description",
        content:
          "A premium ICT showroom in your pocket. Browse laptops, monitors, printers, networking, storage and CCTV. Cash on delivery island-wide.",
      },
      { property: "og:title", content: "ICT Showroom — Laptops, Monitors, Printers & More" },
      {
        property: "og:description",
        content: "Browse premium ICT products and order in seconds. Cash on delivery island-wide.",
      },
    ],
  }),
  component: Home,
});

function Section({
  id,
  title,
  subtitle,
  products,
}: {
  id?: string;
  title: string;
  subtitle: string;
  products: Product[];
}) {
  if (products.length === 0) return null;
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to="/products">
            View all <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

const REVIEWS = [
  {
    name: "Nuwan P.",
    text: "Ordered a laptop at night and it was confirmed on WhatsApp within minutes. Genuine product, sealed box.",
  },
  {
    name: "Fathima R.",
    text: "The printer arrived in two days and cash on delivery made it so easy. Highly recommended.",
  },
  {
    name: "Kasun D.",
    text: "Great prices on SSDs and RAM. The team helped me pick the right upgrade for my desktop.",
  },
];

const WHY = [
  { icon: BadgeCheck, title: "Genuine ICT products", text: "Authentic stock with manufacturer warranty." },
  {
    icon: Truck,
    title: "Island-wide delivery",
    text: `Flat ${formatPrice(DELIVERY_CHARGE)} delivery charge on every order, paid by the customer.`,
  },
  { icon: Wallet, title: "Cash on delivery", text: "Pay only when your order reaches your door." },
  { icon: MessageCircle, title: "WhatsApp ordering", text: "Send your order on WhatsApp in one tap." },
  { icon: Headphones, title: "Customer support", text: "Talk to a specialist before and after you buy." },
];

const BRANDS = ["HP", "Dell", "Lenovo", "Asus", "Logitech", "TP-Link", "Canon", "Epson"];

function Home() {
  const { data } = useSuspenseQuery(storefrontQuery);
  const { categories, products } = data;

  const featured = products.filter((product) => product.is_featured);
  const bestSellers = products.filter((product) => product.is_best_seller);
  const newArrivals = products.filter((product) => product.is_new_arrival);
  const offers = products.filter((product) => product.is_special_offer);

  return (
    <>
      <HeroEntry />

      <div id="categories" className="scroll-mt-20">
        <CategoryShowroom categories={categories} />
      </div>

      <section className="mx-auto mt-6 max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border/70">
          <img
            src={heroImage}
            alt="Laptop, curved monitor and router in a blue-lit technology showroom"
            width={1600}
            height={1008}
            className="h-[380px] w-full object-cover sm:h-[460px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <h2 className="max-w-xl font-display text-2xl font-extrabold leading-tight sm:text-4xl">
              Technology, <span className="text-gradient">beautifully delivered</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              Laptops, monitors, networking, storage and smart devices — handpicked, fairly priced
              and delivered to your doorstep.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/products">
                  Shop Now <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <WhatsAppButton message="Hello, I would like to place an order." />
            </div>
          </div>
        </div>
      </section>

      <Section title="Featured products" subtitle="Handpicked by our team" products={featured} />
      <Section title="Best sellers" subtitle="What customers buy most" products={bestSellers} />
      <Section title="New arrivals" subtitle="Fresh in the showroom" products={newArrivals} />
      <Section title="Special offers" subtitle="Limited-time reduced prices" products={offers} />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Popular categories</h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="flex h-full items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/50"
              >
                <span className="text-2xl" aria-hidden="true">
                  {category.icon}
                </span>
                <span className="text-sm font-semibold leading-snug">{category.category_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Why choose us</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((item) => (
            <li key={item.title} className="rounded-2xl border border-border/70 bg-card p-5">
              <item.icon className="size-6 text-accent" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Customer reviews</h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <li key={review.name} className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex gap-0.5 text-accent" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{review.text}</p>
              <p className="mt-3 text-sm font-semibold">{review.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="glass-panel rounded-3xl p-6 sm:p-10">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Delivery information</h2>
          <div className="mt-4 grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
            <p>
              <span className="block font-semibold text-foreground">Flat delivery charge</span>
              {formatPrice(DELIVERY_CHARGE)} on every order, island-wide, paid by the customer.
            </p>
            <p>
              <span className="block font-semibold text-foreground">Delivery time</span>
              Usually 2–4 working days after we confirm your order by phone.
            </p>
            <p>
              <span className="block font-semibold text-foreground">Payment</span>
              Cash on delivery — pay the courier when your order arrives.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
