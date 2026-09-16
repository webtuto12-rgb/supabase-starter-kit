import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/store";
import laptopObject from "@/assets/obj-laptop.png";
import monitorObject from "@/assets/obj-monitor.png";
import gamingObject from "@/assets/obj-gaming.png";
import routerObject from "@/assets/obj-router.png";
import printerObject from "@/assets/obj-printer.png";
import storageObject from "@/assets/obj-storage.png";
import accessoriesObject from "@/assets/obj-accessories.png";
import mobileObject from "@/assets/obj-mobile.png";
import cctvObject from "@/assets/obj-cctv.png";
import officeObject from "@/assets/obj-office.png";

type PodArt = { image: string; alt: string; tagline: string };

const ART: Record<string, PodArt> = {
  "laptops-computers": {
    image: laptopObject,
    alt: "Floating silver laptop with a glowing blue screen",
    tagline: "Work. Create. Play.",
  },
  monitors: {
    image: monitorObject,
    alt: "Floating curved ultrawide monitor",
    tagline: "Curved & ultrawide",
  },
  gaming: {
    image: gamingObject,
    alt: "Floating gaming controller",
    tagline: "Built for performance",
  },
  networking: {
    image: routerObject,
    alt: "Floating wifi router with four antennas",
    tagline: "Fast, stable Wi-Fi",
  },
  printers: {
    image: printerObject,
    alt: "Floating all-in-one office printer",
    tagline: "Print, scan, copy",
  },
  storage: {
    image: storageObject,
    alt: "Floating NVMe SSD and RAM module",
    tagline: "SSD, HDD & RAM",
  },
  accessories: {
    image: accessoriesObject,
    alt: "Keyboard, mouse, headset and webcam collection",
    tagline: "Keyboards, mice & more",
  },
  "mobile-accessories": {
    image: mobileObject,
    alt: "Power bank, charger, cables and earbuds",
    tagline: "Chargers, cables, power banks",
  },
  "cctv-smart": {
    image: cctvObject,
    alt: "CCTV dome camera, bullet camera and smart hub",
    tagline: "Secure & automate",
  },
  "office-solutions": {
    image: officeObject,
    alt: "Office desktop computer, scanner and UPS",
    tagline: "Equip your workspace",
  },
};

function ShowroomPod({ category, index }: { category: Category; index: number }) {
  const art = ART[category.slug];
  const fallback = ICONS[category.slug];
  const FallbackIcon = fallback?.icon;
  const tagline = art?.tagline ?? fallback?.tagline ?? "Explore the range";
  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="hero-rise group block"
      style={{ animationDelay: `${0.35 + index * 0.07}s` }}
      aria-label={`${category.category_name} — ${tagline}`}
    >
      <span
        className={`${index % 2 === 0 ? "float-a" : "float-b"} block h-full`}
        style={{ animationDelay: `${(index % 5) * 0.6}s` }}
      >
        <span className="card-3d glass-panel sheen relative flex h-full flex-col items-center justify-end rounded-[1.6rem] p-3 sm:p-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 bottom-3 h-6 rounded-full bg-primary/20 blur-xl"
          />
          {art ? (
            <img
              src={art.image}
              alt={art.alt}
              loading="lazy"
              width={816}
              height={816}
              className="relative mx-auto h-16 w-auto object-contain drop-shadow-[0_14px_22px_rgba(30,58,138,0.28)] transition-transform duration-500 group-hover:scale-105 sm:h-20 lg:h-24"
            />
          ) : (
            <span className="relative flex h-16 items-center justify-center transition-transform duration-500 group-hover:scale-105 sm:h-20 lg:h-24">
              {FallbackIcon ? (
                <FallbackIcon
                  className="size-10 text-primary sm:size-12"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              ) : (
                <span className="text-4xl sm:text-5xl" aria-hidden="true">
                  {category.icon}
                </span>
              )}
            </span>
          )}
          <span className="relative mt-2 block text-center text-[11px] font-semibold leading-tight sm:text-sm">
            {category.category_name}
          </span>
          <span className="relative mt-0.5 hidden text-center text-[11px] text-muted-foreground sm:block">
            {tagline}
          </span>
        </span>
      </span>
    </Link>
  );
}

/** Cinematic showroom entry — the first (and only) category screen. */
export function HeroEntry({ categories }: { categories: Category[] }) {
  return (
    <section className="showroom-bg relative isolate flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden px-4 py-12 sm:py-16">
      {/* Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="tech-grid absolute inset-0" />
        <div className="glow-breathe absolute left-1/2 top-[4%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />
        <div
          className="glow-breathe absolute -left-24 bottom-[12%] h-72 w-72 rounded-full bg-accent/15 blur-[120px]"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="glow-breathe absolute -right-24 top-[28%] h-72 w-72 rounded-full bg-accent/10 blur-[120px]"
          style={{ animationDelay: "5s" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-[10%] bottom-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Centre message */}
        <div className="relative z-10 mx-auto max-w-2xl px-1 text-center">
          <p
            className="hero-rise inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/80 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary backdrop-blur-md sm:text-xs"
            style={{ animationDelay: "0.05s" }}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            The ICT Showroom
          </p>

          <h1
            className="hero-rise mt-6 font-display text-[2.15rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.15s" }}
          >
            Explore Your <span className="text-gradient">Technology</span> World
          </h1>

          <p
            className="hero-rise mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base"
            style={{ animationDelay: "0.25s" }}
          >
            Laptops, accessories, networking, gaming and smart solutions — all in one place.
          </p>

          <div
            className="hero-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.35s" }}
          >
            <Button asChild size="lg" className="w-full rounded-full glow-ring sm:w-auto">
              <a href="#categories">
                <Sparkles className="size-4" aria-hidden="true" />
                Explore Categories
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-full border-primary/30 bg-white/70 backdrop-blur-md sm:w-auto"
            >
              <Link to="/products">
                View All Products
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Floating category pods — the only category grid on the homepage */}
        <div
          id="categories"
          className="relative mt-10 grid scroll-mt-24 grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-12 lg:grid-cols-5"
        >
          {categories.map((category, index) => (
            <ShowroomPod key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>

      <a
        href="#featured"
        className="relative mx-auto mt-10 flex flex-col items-center gap-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Start shopping
        <ChevronDown className="size-4 animate-float" aria-hidden="true" />
      </a>
    </section>
  );
}
