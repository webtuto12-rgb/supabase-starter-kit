import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DELIVERY_CHARGE, WHATSAPP_NUMBER, formatPrice } from "@/lib/store";

const POLICIES = [
  { slug: "refund-policy", label: "Refund Policy" },
  { slug: "return-policy", label: "Return Policy" },
  { slug: "warranty-policy", label: "Warranty Policy" },
  { slug: "delivery-policy", label: "Delivery Policy" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms-conditions", label: "Terms & Conditions" },
];

const TRUST = [
  { icon: Wallet, label: "Cash on delivery" },
  { icon: Truck, label: "Island-wide delivery" },
  { icon: BadgeCheck, label: "Genuine products" },
  { icon: Headphones, label: "WhatsApp support" },
];

export function Footer() {
  return (
    <footer className="no-print relative mt-24 overflow-hidden border-t border-primary/10 bg-surface/70">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="tech-grid absolute inset-0 opacity-60" />
        <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-[110px]" />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-[110px]" />
      </div>

      {/* Trust strip */}
      <div className="mx-auto max-w-7xl px-4 pt-10">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRUST.map((item) => (
            <li
              key={item.label}
              className="glass-panel flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-xs font-semibold sm:text-sm"
            >
              <item.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-8 max-w-7xl px-4">
        <div className="glass-panel flex flex-col items-start gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h3 className="font-display text-xl font-extrabold sm:text-2xl">
              Need help choosing the right device?
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Message us on WhatsApp and we’ll recommend the best option for your budget.
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button asChild className="flex-1 rounded-full glow-ring sm:flex-none">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp us
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 rounded-full border-primary/30 bg-white/70 sm:flex-none"
            >
              <Link to="/products">
                Shop now <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] font-display text-sm font-bold text-primary-foreground">
              ICT
            </span>
            <h3 className="font-display text-lg font-bold text-gradient">ICT Showroom</h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Premium laptops, accessories, networking, gaming and smart solutions — delivered
            island-wide with cash on delivery.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="transition-colors hover:text-primary">
                All products
              </Link>
            </li>
            <li>
              <Link to="/cart" className="transition-colors hover:text-primary">
                Your cart
              </Link>
            </li>
            <li>
              <Link to="/policies" className="transition-colors hover:text-primary">
                Policies
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Customer care</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {POLICIES.map((policy) => (
              <li key={policy.slug}>
                <Link
                  to="/policies/$slug"
                  params={{ slug: policy.slug }}
                  className="transition-colors hover:text-primary"
                >
                  {policy.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href="tel:+94710672207" className="transition-colors hover:text-primary">
                071 067 2207
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <a
                href="mailto:ameerjezme@gmail.com"
                className="break-all transition-colors hover:text-primary"
              >
                ameerjezme@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Delivery across Sri Lanka
            </li>
            <li className="flex items-start gap-2.5">
              <Truck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Flat delivery {formatPrice(DELIVERY_CHARGE)}
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Manufacturer warranty
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ICT Showroom. All rights reserved.</p>
          <p>Cash on delivery • Island-wide • No account needed</p>
        </div>
      </div>
    </footer>
  );
}
