import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, LogOut, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  createSignedImageUrl,
  deleteCategory,
  deleteProduct,
  getAdminOverview,
  saveCategory,
  saveContent,
  saveProduct,
  updateOrderStatus,
} from "@/lib/admin.functions";
import {
  formatPrice,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type Category,
  type Order,
  type OrderItem,
  type Product,
} from "@/lib/store";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — ICT Showroom" },
      { name: "description", content: "Manage products, categories, orders and site content." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Dashboard — ICT Showroom" },
      { property: "og:description", content: "Store administration." },
    ],
  }),
  component: AdminDashboard,
});

type ContentRow = {
  id: string;
  content_key: string;
  content_type: string;
  title: string;
  body: string;
  is_published: boolean;
};

const emptyProduct = {
  product_name: "",
  slug: "",
  description: "",
  price: 0,
  discount_price: null as number | null,
  category_id: null as string | null,
  brand: "",
  model: "",
  stock: 0,
  image_url: null as string | null,
  processor: null as string | null,
  ram: null as string | null,
  storage: null as string | null,
  is_featured: false,
  is_best_seller: false,
  is_new_arrival: false,
  is_special_offer: false,
  is_active: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const loadOverview = useServerFn(getAdminOverview);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => loadOverview(),
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    void queryClient.invalidateQueries({ queryKey: ["storefront"] });
    void queryClient.invalidateQueries({ queryKey: ["policies"] });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">No admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String((error as Error | undefined)?.message ?? "").includes("Forbidden")
            ? "This account is signed in but is not an administrator yet."
            : "We couldn't load the dashboard. Please sign in again."}
        </p>
        <Button
          className="mt-6 rounded-full"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  const orders = (data.orders ?? []) as unknown as Order[];
  const products = (data.products ?? []) as unknown as Product[];
  const categories = (data.categories ?? []) as unknown as Category[];
  const content = (data.content ?? []) as unknown as ContentRow[];

  const revenue = orders
    .filter((order) => order.order_status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage products, categories, orders and website content.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">View store</Link>
          </Button>
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={async () => {
              await supabase.auth.signOut();
              queryClient.clear();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Orders" value={String(orders.length)} />
        <StatCard
          label="New orders"
          value={String(orders.filter((order) => order.order_status === "new").length)}
        />
        <StatCard label="Products" value={String(products.length)} />
        <StatCard label="Order value" value={formatPrice(revenue)} />
      </div>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="content">Website content</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-5">
          <OrdersPanel orders={orders} onSaved={refresh} />
        </TabsContent>
        <TabsContent value="products" className="mt-5">
          <ProductsPanel products={products} categories={categories} onSaved={refresh} />
        </TabsContent>
        <TabsContent value="categories" className="mt-5">
          <CategoriesPanel categories={categories} onSaved={refresh} />
        </TabsContent>
        <TabsContent value="content" className="mt-5">
          <ContentPanel content={content} onSaved={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold">{value}</p>
    </div>
  );
}

function OrdersPanel({ orders, onSaved }: { orders: Order[]; onSaved: () => void }) {
  const setStatus = useServerFn(updateOrderStatus);
  const removeOrders = useServerFn(deleteOrders);
  const [selected, setSelected] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (input: { id: string; order_status: string }) =>
      setStatus({ data: input as never }),
    onSuccess: () => {
      toast.success("Order updated — emails sent");
      onSaved();
    },
    onError: (mutationError: Error) =>
      toast.error("Could not update order", { description: mutationError.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => removeOrders({ data: { ids } }),
    onSuccess: () => {
      toast.success("Orders deleted");
      setSelected([]);
      onSaved();
    },
    onError: (deleteError: Error) =>
      toast.error("Could not delete orders", { description: deleteError.message }),
  });

  const [filter, setFilter] = useState<string>("all");
  const visible = useMemo(
    () => (filter === "all" ? orders : orders.filter((order) => order.order_status === filter)),
    [orders, filter],
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  const allSelected = visible.length > 0 && visible.every((order) => selected.includes(order.id));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {ORDER_STATUSES.map((status) => (
          <FilterChip key={status} active={filter === status} onClick={() => setFilter(status)}>
            {ORDER_STATUS_LABELS[status]}
          </FilterChip>
        ))}
      </div>

      {visible.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-surface px-3 py-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) =>
                setSelected(checked ? visible.map((order) => order.id) : [])
              }
            />
            Select all ({visible.length})
          </label>
          <span className="text-xs text-muted-foreground">{selected.length} selected</span>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto rounded-full"
            disabled={selected.length === 0 || deleteMutation.isPending}
            onClick={() => {
              if (window.confirm(`Delete ${selected.length} order(s)? This cannot be undone.`)) {
                deleteMutation.mutate(selected);
              }
            }}
          >
            <Trash2 className="size-3.5" aria-hidden="true" /> Delete selected
          </Button>
        </div>
      )}

      {visible.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No orders in this list yet.</p>
      )}

      <ul className="mt-5 space-y-3">
        {visible.map((order) => (
          <li key={order.id} className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                <Checkbox
                  className="mt-1"
                  checked={selected.includes(order.id)}
                  onCheckedChange={() => toggle(order.id)}
                  aria-label={`Select order ${order.order_number}`}
                />
                <div>
                  <p className="font-display text-sm font-bold">#{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_name} • {order.phone}
                    {order.email ? ` • ${order.email}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.address}
                    {order.city ? `, ${order.city}` : ""}
                  </p>
                  {order.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">Notes: {order.notes}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-base font-bold">
                  {formatPrice(Number(order.total))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Delivery {formatPrice(Number(order.delivery_charge))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleString("en-LK")}
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {((order.products ?? []) as OrderItem[]).map((item) => (
                <li key={item.id}>
                  {item.name} x {item.quantity} — {formatPrice(item.price * item.quantity)}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={order.order_status}
                onValueChange={(value) => mutation.mutate({ id: order.id, order_status: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => {
                  if (window.confirm(`Delete order #${order.order_number}?`)) {
                    deleteMutation.mutate([order.id]);
                  }
                }}
              >
                <Trash2 className="size-3.5" aria-hidden="true" /> Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ImageUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const sign = useServerFn(createSignedImageUrl);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "31536000",
      });
      if (error) throw error;
      const { url } = await sign({ data: { path } });
      onChange(url);
      toast.success("Image uploaded");
    } catch (uploadError) {
      toast.error("Upload failed", { description: (uploadError as Error).message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>Image</Label>
      {value && (
        <img
          src={value}
          alt="Selected"
          className="h-28 w-full rounded-xl border border-border/70 object-cover"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full" disabled={uploading}>
          <label className="cursor-pointer">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            Upload image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
        </Button>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      <Input
        placeholder="Or paste an image URL"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      />
    </div>
  );
}

function ProductsPanel({
  products,
  categories,
  onSaved,
}: {
  products: Product[];
  categories: Category[];
  onSaved: () => void;
}) {
  const save = useServerFn(saveProduct);
  const remove = useServerFn(deleteProduct);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof emptyProduct & { id?: string }>(emptyProduct);
  const [search, setSearch] = useState("");

  const saveMutation = useMutation({
    mutationFn: (values: typeof form) =>
      save({
        data: {
          ...values,
          slug: values.slug || slugify(values.product_name),
          specifications: {},
        } as never,
      }),
    onSuccess: () => {
      toast.success("Product saved");
      setOpen(false);
      onSaved();
    },
    onError: (saveError: Error) =>
      toast.error("Could not save product", { description: saveError.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      onSaved();
    },
    onError: (deleteError: Error) =>
      toast.error("Could not delete product", { description: deleteError.message }),
  });

  const visible = products.filter((product) =>
    `${product.product_name} ${product.brand}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <Button
          className="rounded-full"
          onClick={() => {
            setForm(emptyProduct);
            setOpen(true);
          }}
        >
          <Plus className="size-4" aria-hidden="true" /> Add product
        </Button>
      </div>

      <ul className="mt-5 space-y-2">
        {visible.map((product) => (
          <li
            key={product.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{product.product_name}</p>
              <p className="text-xs text-muted-foreground">
                {product.brand} • stock {product.stock} •{" "}
                {formatPrice(Number(product.discount_price || product.price))}
                {product.is_active ? "" : " • hidden"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setForm({
                  id: product.id,
                  product_name: product.product_name,
                  slug: product.slug,
                  description: product.description,
                  price: Number(product.price),
                  discount_price:
                    product.discount_price === null ? null : Number(product.discount_price),
                  category_id: product.category_id,
                  brand: product.brand,
                  model: product.model,
                  stock: product.stock,
                  image_url: product.image_url,
                  processor: product.processor,
                  ram: product.ram,
                  storage: product.storage,
                  is_featured: product.is_featured,
                  is_best_seller: product.is_best_seller,
                  is_new_arrival: product.is_new_arrival,
                  is_special_offer: product.is_special_offer,
                  is_active: true,
                });
                setOpen(true);
              }}
            >
              <Pencil className="size-3.5" aria-hidden="true" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (window.confirm(`Delete ${product.product_name}?`)) {
                  deleteMutation.mutate(product.id);
                }
              }}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="product_name">Product name</Label>
              <Input
                id="product_name"
                value={form.product_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    product_name: event.target.value,
                    slug: current.id ? current.slug : slugify(event.target.value),
                  }))
                }
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="price">Price (LKR)</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: Number(event.target.value) }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="discount_price">Discount price (optional)</Label>
              <Input
                id="discount_price"
                type="number"
                value={form.discount_price ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    discount_price: event.target.value === "" ? null : Number(event.target.value),
                  }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category_id ?? ""}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, category_id: value || null }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={form.stock}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stock: Number(event.target.value) }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={(event) =>
                  setForm((current) => ({ ...current, brand: event.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(event) =>
                  setForm((current) => ({ ...current, model: event.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="processor">Processor</Label>
              <Input
                id="processor"
                value={form.processor ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, processor: event.target.value || null }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="ram">RAM</Label>
              <Input
                id="ram"
                value={form.ram ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ram: event.target.value || null }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="storage">Storage</Label>
              <Input
                id="storage"
                value={form.storage ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, storage: event.target.value || null }))
                }
                className="mt-1.5"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploader
                value={form.image_url}
                onChange={(url) => setForm((current) => ({ ...current, image_url: url }))}
              />
            </div>

            <div className="sm:col-span-2">
              <Separator className="my-1" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ToggleRow
                  label="Featured"
                  checked={form.is_featured}
                  onChange={(checked) =>
                    setForm((current) => ({ ...current, is_featured: checked }))
                  }
                />
                <ToggleRow
                  label="Best seller"
                  checked={form.is_best_seller}
                  onChange={(checked) =>
                    setForm((current) => ({ ...current, is_best_seller: checked }))
                  }
                />
                <ToggleRow
                  label="New arrival"
                  checked={form.is_new_arrival}
                  onChange={(checked) =>
                    setForm((current) => ({ ...current, is_new_arrival: checked }))
                  }
                />
                <ToggleRow
                  label="Special offer"
                  checked={form.is_special_offer}
                  onChange={(checked) =>
                    setForm((current) => ({ ...current, is_special_offer: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || form.product_name.trim().length < 2}
            >
              {saveMutation.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Save product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-surface px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const emptyCategory = {
  category_name: "",
  slug: "",
  icon: "",
  description: "",
  category_image: null as string | null,
  card_image: null as string | null,
  display_order: 0,
  is_active: true,
};

function CategoriesPanel({
  categories,
  onSaved,
}: {
  categories: Category[];
  onSaved: () => void;
}) {
  const save = useServerFn(saveCategory);
  const remove = useServerFn(deleteCategory);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof emptyCategory & { id?: string }>(emptyCategory);

  const saveMutation = useMutation({
    mutationFn: (values: typeof form) =>
      save({ data: { ...values, slug: values.slug || slugify(values.category_name) } as never }),
    onSuccess: () => {
      toast.success("Category saved");
      setOpen(false);
      onSaved();
    },
    onError: (saveError: Error) =>
      toast.error("Could not save category", { description: saveError.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      onSaved();
    },
    onError: (deleteError: Error) =>
      toast.error("Could not delete category", { description: deleteError.message }),
  });

  return (
    <div>
      <div className="flex justify-end">
        <Button
          className="rounded-full"
          onClick={() => {
            setForm(emptyCategory);
            setOpen(true);
          }}
        >
          <Plus className="size-4" aria-hidden="true" /> Add category
        </Button>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
          >
            <span aria-hidden="true" className="text-xl">
              {category.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{category.category_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                order {category.display_order} • /{category.slug}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setForm({
                  id: category.id,
                  category_name: category.category_name,
                  slug: category.slug,
                  icon: category.icon,
                  description: category.description,
                  category_image: category.category_image,
                  card_image: category.card_image,
                  display_order: category.display_order,
                  is_active: true,
                });
                setOpen(true);
              }}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (window.confirm(`Delete ${category.category_name}?`)) {
                  deleteMutation.mutate(category.id);
                }
              }}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="category_name">Name</Label>
              <Input
                id="category_name"
                value={form.category_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category_name: event.target.value,
                    slug: current.id ? current.slug : slugify(event.target.value),
                  }))
                }
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  value={form.icon}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, icon: event.target.value }))
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={form.display_order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      display_order: Number(event.target.value),
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category_description">Description</Label>
              <Textarea
                id="category_description"
                rows={2}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <ImageUploader
              value={form.card_image}
              onChange={(url) =>
                setForm((current) => ({ ...current, card_image: url, category_image: url }))
              }
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || form.category_name.trim().length < 2}
            >
              {saveMutation.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Save category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContentPanel({ content, onSaved }: { content: ContentRow[]; onSaved: () => void }) {
  const save = useServerFn(saveContent);
  const [drafts, setDrafts] = useState<Record<string, { title: string; body: string }>>({});

  const mutation = useMutation({
    mutationFn: (values: { id: string; title: string; body: string; is_published: boolean }) =>
      save({ data: values as never }),
    onSuccess: () => {
      toast.success("Content saved");
      onSaved();
    },
    onError: (saveError: Error) =>
      toast.error("Could not save content", { description: saveError.message }),
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Edit policy pages and site text. Changes appear on the website immediately.
      </p>
      {content.map((row) => {
        const draft = drafts[row.id] ?? { title: row.title, body: row.body };
        return (
          <div key={row.id} className="rounded-2xl border border-border/70 bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {row.content_type} • {row.content_key}
            </p>
            <Input
              value={draft.title}
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [row.id]: { ...draft, title: event.target.value },
                }))
              }
              className="mt-2"
            />
            <Textarea
              rows={8}
              value={draft.body}
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [row.id]: { ...draft, body: event.target.value },
                }))
              }
              className="mt-2"
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                className="rounded-full"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({
                    id: row.id,
                    title: draft.title,
                    body: draft.body,
                    is_published: row.is_published,
                  })
                }
              >
                Save changes
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
