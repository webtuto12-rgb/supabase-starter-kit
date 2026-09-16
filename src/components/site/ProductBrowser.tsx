import { useMemo, useState } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "./ProductCard";
import { effectivePrice, formatPrice, type Category, type Product } from "@/lib/store";

type SortKey = "newest" | "price-asc" | "price-desc" | "name";

function unique(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((value): value is string => !!value && value !== ""))).sort();
}

export function ProductBrowser({
  products,
  categories,
  initialQuery = "",
  showCategoryFilter = false,
}: {
  products: Product[];
  categories: Category[];
  initialQuery?: string;
  showCategoryFilter?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("newest");
  const [brands, setBrands] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [processors, setProcessors] = useState<string[]>([]);
  const [rams, setRams] = useState<string[]>([]);
  const [storages, setStorages] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [bestSellersOnly, setBestSellersOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const maxPrice = useMemo(
    () => Math.max(10000, ...products.map((product) => effectivePrice(product))),
    [products],
  );
  const [priceCap, setPriceCap] = useState<number | null>(null);

  const brandOptions = useMemo(() => unique(products.map((p) => p.brand)), [products]);
  const processorOptions = useMemo(() => unique(products.map((p) => p.processor)), [products]);
  const ramOptions = useMemo(() => unique(products.map((p) => p.ram)), [products]);
  const storageOptions = useMemo(() => unique(products.map((p) => p.storage)), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cap = priceCap ?? maxPrice;
    const categoryNameById = new Map(categories.map((c) => [c.id, c.category_name.toLowerCase()]));

    const result = products.filter((product) => {
      if (q) {
        const haystack = [
          product.product_name,
          product.brand,
          product.model,
          product.description,
          product.category_id ? (categoryNameById.get(product.category_id) ?? "") : "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (brands.length && !brands.includes(product.brand)) return false;
      if (categoryIds.length && (!product.category_id || !categoryIds.includes(product.category_id)))
        return false;
      if (processors.length && (!product.processor || !processors.includes(product.processor)))
        return false;
      if (rams.length && (!product.ram || !rams.includes(product.ram))) return false;
      if (storages.length && (!product.storage || !storages.includes(product.storage))) return false;
      if (inStockOnly && product.stock <= 0) return false;
      if (newOnly && !product.is_new_arrival) return false;
      if (bestSellersOnly && !product.is_best_seller) return false;
      if (effectivePrice(product) > cap) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "price-asc") return effectivePrice(a) - effectivePrice(b);
      if (sort === "price-desc") return effectivePrice(b) - effectivePrice(a);
      if (sort === "name") return a.product_name.localeCompare(b.product_name);
      return 0;
    });
  }, [
    products,
    categories,
    query,
    brands,
    categoryIds,
    processors,
    rams,
    storages,
    inStockOnly,
    newOnly,
    bestSellersOnly,
    priceCap,
    maxPrice,
    sort,
  ]);

  function toggle(list: string[], setList: (values: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function resetAll() {
    setBrands([]);
    setCategoryIds([]);
    setProcessors([]);
    setRams([]);
    setStorages([]);
    setInStockOnly(false);
    setNewOnly(false);
    setBestSellersOnly(false);
    setPriceCap(null);
  }

  const filterGroup = (
    title: string,
    options: string[],
    selected: string[],
    setSelected: (values: string[]) => void,
  ) =>
    options.length > 1 ? (
      <div key={title}>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                id={`${title}-${option}`}
                checked={selected.includes(option)}
                onCheckedChange={() => toggle(selected, setSelected, option)}
              />
              <Label htmlFor={`${title}-${option}`} className="text-sm font-normal">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const sidebar = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={resetAll} className="h-8 text-xs">
          Reset
        </Button>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Availability
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={(value) => setInStockOnly(value === true)}
            />
            <Label htmlFor="in-stock" className="text-sm font-normal">
              In stock only
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="new-only"
              checked={newOnly}
              onCheckedChange={(value) => setNewOnly(value === true)}
            />
            <Label htmlFor="new-only" className="text-sm font-normal">
              New arrivals
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="best-only"
              checked={bestSellersOnly}
              onCheckedChange={(value) => setBestSellersOnly(value === true)}
            />
            <Label htmlFor="best-only" className="text-sm font-normal">
              Best sellers
            </Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Max price — {formatPrice(priceCap ?? maxPrice)}
        </h3>
        <Slider
          value={[priceCap ?? maxPrice]}
          min={1000}
          max={maxPrice}
          step={1000}
          onValueChange={(value) => setPriceCap(value[0] ?? maxPrice)}
        />
      </div>

      {showCategoryFilter &&
        filterGroup(
          "Category",
          categories.map((category) => category.category_name),
          categories.filter((c) => categoryIds.includes(c.id)).map((c) => c.category_name),
          (names) =>
            setCategoryIds(
              categories.filter((c) => names.includes(c.category_name)).map((c) => c.id),
            ),
        )}
      {filterGroup("Brand", brandOptions, brands, setBrands)}
      {filterGroup("Processor", processorOptions, processors, setProcessors)}
      {filterGroup("RAM", ramOptions, rams, setRams)}
      {filterGroup("Storage", storageOptions, storages, setStorages)}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
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
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
            <SelectTrigger className="w-[170px] rounded-full bg-surface" aria-label="Sort products">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="rounded-full lg:hidden"
            onClick={() => setFiltersOpen((value) => !value)}
          >
            {filtersOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <SlidersHorizontal className="size-4" aria-hidden="true" />
            )}
            Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border/70 bg-card p-5">
            {sidebar}
          </div>
        </aside>

        {filtersOpen && (
          <div className="rounded-2xl border border-border/70 bg-card p-5 lg:hidden">{sidebar}</div>
        )}

        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/70 bg-card p-10 text-center">
              <p className="font-semibold">No products match your search</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different keyword or reset the filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
