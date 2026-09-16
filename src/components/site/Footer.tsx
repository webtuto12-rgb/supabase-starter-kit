import { Link } from "@tanstack/react-router";
import { Phone, ShieldCheck, Truck } from "lucide-react";
import { DELIVERY_CHARGE, formatPrice } from "@/lib/store";

const POLICIES = [
  { slug: "refund-policy", label: "Refund Policy" },
  { slug: "return-policy", label: "Return Policy" },
  { slug: "warranty-policy", label: "Warranty Policy" },
  { slug: "delivery-policy", label: "Delivery Policy" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms-conditions", label: "Terms & Conditions" },
];

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-border/60 bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-bold text-gradient">ICT Showroom</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium ICT products with island-wide delivery and cash on delivery. Order online or
            straight through WhatsApp.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-foreground">
                All products
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-foreground">
                Your cart
              </Link>
            </li>
            <li>
              <Link to="/policies" className="hover:text-foreground">
                Policies
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Customer care</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {POLICIES.map((policy) => (
              <li key={policy.slug}>
                <Link
                  to="/policies/$slug"
                  params={{ slug: policy.slug }}
                  className="hover:text-foreground"
                >
                  {policy.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <h4 className="text-sm font-semibold text-foreground">Delivery & support</h4>
          <p className="flex items-start gap-2">
            <Truck className="mt-0.5 size-4 text-accent" aria-hidden="true" />
            Flat delivery charge {formatPrice(DELIVERY_CHARGE)} island-wide
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 text-accent" aria-hidden="true" />
            Manufacturer warranty on all products
          </p>
          <p className="flex items-start gap-2">
            <Phone className="mt-0.5 size-4 text-accent" aria-hidden="true" />
            WhatsApp / Call 071 067 2207
          </p>
        </div>
      </div>

      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ICT Showroom. Cash on delivery available island-wide.
      </div>
    </footer>
  );
}
