import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import laptopObject from "@/assets/obj-laptop.png";
import monitorObject from "@/assets/obj-monitor.png";
import gamingObject from "@/assets/obj-gaming.png";
import routerObject from "@/assets/obj-router.png";
import printerObject from "@/assets/obj-printer.png";
import storageObject from "@/assets/obj-storage.png";

type Pod = {
  slug: string;
  label: string;
  tagline: string;
  image: string;
  alt: string;
  /** Desktop placement + float rhythm. */
  place: string;
  float: string;
  delay: string;
};

const PODS: Pod[] = [
  {
    slug: "laptops-computers",
    label: "Laptops & Computers",
    tagline: "Work. Create. Play.",
    image: laptopObject,
    alt: "Floating silver laptop with a glowing blue screen",
    place: "lg:absolute lg:left-[2%] lg:top-[14%] lg:w-56 xl:w-60",
    float: "float-a",
    delay: "0s",
  },
  {
    slug: "monitors",
    label: "Monitors",
    tagline: "Curved & ultrawide",
    image: monitorObject,
    alt: "Floating curved ultrawide monitor",
    place: "lg:absolute lg:right-[2%] lg:top-[12%] lg:w-56 xl:w-60",
    float: "float-b",
    delay: "0.6s",
  },
  {
    slug: "gaming",
    label: "Gaming",
    tagline: "Built for performance",
    image: gamingObject,
    alt: "Floating black gaming controller with violet lighting",
    place: "lg:absolute lg:left-[9%] lg:bottom-[8%] lg:w-48 xl:w-52",
    float: "float-b",
    delay: "1.1s",
  },
  {
    slug: "networking",
    label: "Networking",
    tagline: "Fast, stable Wi-Fi",
    image: routerObject,
    alt: "Floating black wifi router with four antennas",
    place: "lg:absolute lg:right-[9%] lg:bottom-[8%] lg:w-48 xl:w-52",
    float: "float-a",
    delay: "1.6s",
  },
  {
    slug: "printers",
    label: "Printers",
    tagline: "Print, scan, copy",
    image: printerObject,
    alt: "Floating all-in-one office printer",
    place: "lg:absolute lg:left-[27%] lg:top-[1%] lg:w-40 xl:w-44",
    float: "float-b",
    delay: "2s",
  },
  {
    slug: "storage",
    label: "Storage",
    tagline: "SSD, HDD & RAM",
    image: storageObject,
    alt: "Floating NVMe SSD and RAM module",
    place: "lg:absolute lg:right-[27%] lg:bottom-[1%] lg:w-40 xl:w-44",
    float: "float-a",
    delay: "2.4s",
  },
];

function ShowroomPod({ pod, index }: { pod: Pod; index: number }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug: pod.slug }}
      className={`${pod.place} hero-rise group block`}
      style={{ animationDelay: `${0.35 + index * 0.12}s` }}
      aria-label={`${pod.label} — ${pod.tagline}`}
    >
      <span className={`${pod.float} block`} style={{ animationDelay: pod.delay }}>
        <span className="card-3d glass-panel sheen relative block rounded-[1.6rem] p-3 sm:p-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 bottom-2 h-6 rounded-full bg-primary/25 blur-xl"
          />
          <img
            src={pod.image}
            alt={pod.alt}
            loading="lazy"
            width={816}
            height={816}
            className="relative mx-auto h-20 w-auto object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:scale-105 sm:h-24 lg:h-28"
          />
          <span className="relative mt-2 block text-center text-[11px] font-semibold leading-tight sm:text-sm">
            {pod.label}
          </span>
          <span className="relative mt-0.5 hidden text-center text-[11px] text-muted-foreground sm:block">
            {pod.tagline}
          </span>
        </span>
      </span>
    </Link>
  );
}

/** Cinematic showroom entry — the first screen visitors see. */
export function HeroEntry() {
  return (
    <section className="showroom-bg relative isolate flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden px-4 py-12 sm:py-16">
      {/* Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="tech-grid absolute inset-0" />
        <div className="glow-breathe absolute left-1/2 top-[6%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[130px]" />
        <div
          className="glow-breathe absolute -left-24 bottom-[12%] h-72 w-72 rounded-full bg-accent/20 blur-[120px]"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="glow-breathe absolute -right-24 top-[28%] h-72 w-72 rounded-full bg-accent/15 blur-[120px]"
          style={{ animationDelay: "5s" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-[10%] bottom-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl lg:min-h-[38rem]">
        {/* Centre message */}
        <div className="relative z-10 mx-auto max-w-2xl px-1 text-center lg:py-24">
          <p
            className="hero-rise inline-flex items-center gap-2 rounded-full border border-primary/30 bg-surface/60 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent backdrop-blur-md sm:text-xs"
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
              className="w-full rounded-full border-primary/30 bg-surface/60 backdrop-blur-md sm:w-auto"
            >
              <Link to="/products">
                View All Products
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Floating product objects: grid on mobile, orbiting the message on desktop */}
        <div className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-0 lg:block">
          {PODS.map((pod, index) => (
            <ShowroomPod key={pod.slug} pod={pod} index={index} />
          ))}
        </div>
      </div>

      <a
        href="#categories"
        className="relative mx-auto mt-10 flex flex-col items-center gap-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Step inside
        <ChevronDown className="size-4 animate-float" aria-hidden="true" />
      </a>
    </section>
  );
}
