import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/store";

/** Floating glass category cards — the showroom entry experience. */
export function CategoryShowroom({
  categories,
  onSkip,
}: {
  categories: Category[];
  onSkip?: () => void;
}) {
  return (
    <div className="showroom-bg relative overflow-hidden px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Welcome to the showroom
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-5xl">
          Choose a <span className="text-gradient">category</span> to step inside
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Ten departments of ICT products, ready for cash-on-delivery ordering across the island.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((category, index) => (
            <li key={category.id} style={{ animationDelay: `${(index % 5) * 0.35}s` }}>
              <Link
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="card-3d animate-float glass-panel flex h-full flex-col items-center gap-2 rounded-2xl p-4 text-center sm:p-5"
              >
                <span className="text-3xl sm:text-4xl" aria-hidden="true">
                  {category.icon}
                </span>
                <span className="text-xs font-semibold leading-snug sm:text-sm">
                  {category.category_name}
                </span>
                <span className="hidden text-[11px] text-muted-foreground sm:block">
                  {category.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-primary/40 bg-surface/60"
            onClick={onSkip}
          >
            <Link to="/products">
              Skip &amp; View All Products
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
