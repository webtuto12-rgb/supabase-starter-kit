import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Home,
  LayoutGrid,
  MessageCircle,
  Phone,
  ScrollText,
  Search,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { WHATSAPP_NUMBER } from "@/lib/store";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/products", label: "All Products", icon: LayoutGrid },
  { to: "/policies", label: "Policies", icon: ScrollText },
] as const;

export function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim().slice(0, 80);
    navigate({ to: "/products", search: q ? { q } : {} });
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            ICT
          </span>
          <span className="hidden text-gradient sm:inline">Showroom</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 lg:flex">
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={80}
              placeholder="Search laptops, printers, accessories, networking…"
              aria-label="Search products"
              className="rounded-full border-border bg-surface pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Search"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search className="size-5" />
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Cart">
            <Link to="/cart">
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {/* Animated hamburger */}
          <button
            type="button"
            className="burger md:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
            data-open={menuOpen ? "true" : "false"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="burger-bar" />
            <span className="burger-bar" />
            <span className="burger-bar" />
          </button>
        </div>
      </div>

      {/* Mobile search sheet */}
      {searchOpen && (
        <div className="drawer-drop border-t border-border/60 bg-background px-4 pb-4 pt-3 lg:hidden">
          <form onSubmit={submitSearch}>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                maxLength={80}
                placeholder="Search products, brands, models…"
                aria-label="Search products"
                className="rounded-full border-border bg-surface pl-9"
              />
            </div>
          </form>
        </div>
      )}

      {/* Slide-in menu drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          role="presentation"
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-primary/25 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col border-l border-primary/15 bg-background/95 shadow-[-20px_0_60px_-30px_rgba(30,58,138,0.45)] backdrop-blur-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
            <span className="font-display text-base font-bold text-gradient">Menu</span>
            <button
              type="button"
              className="burger"
              data-open="true"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <span className="burger-bar" />
              <span className="burger-bar" />
              <span className="burger-bar" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {NAV.map((item, index) => (
                <li
                  key={item.to}
                  className={menuOpen ? "menu-item-in" : "opacity-0"}
                  style={{ animationDelay: `${80 + index * 60}ms` }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm font-semibold transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    activeProps={{ className: "border-primary/50 bg-primary/10 text-primary" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    <item.icon className="size-4 text-primary" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
              <li
                className={menuOpen ? "menu-item-in" : "opacity-0"}
                style={{ animationDelay: `${260}ms` }}
              >
                <Link
                  to="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm font-semibold transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <ShoppingCart className="size-4 text-primary" aria-hidden="true" />
                  Your cart
                  {count > 0 && (
                    <span className="ml-auto flex size-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-2 border-t border-border/60 p-4">
            <Button asChild className="w-full rounded-full glow-ring">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden="true" /> Order on WhatsApp
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full rounded-full border-primary/30 bg-white/70"
            >
              <a href="tel:+94710672207">
                <Phone className="size-4" aria-hidden="true" /> 071 067 2207
              </a>
            </Button>
          </div>
        </aside>
      </div>
    </header>
  );
}
