import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [orders, products, categories, content] = await Promise.all([
      context.supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(300),
      context.supabase.from("products").select("*").order("created_at", { ascending: false }),
      context.supabase.from("categories").select("*").order("display_order"),
      context.supabase.from("site_content").select("*").order("display_order"),
    ]);
    for (const result of [orders, products, categories, content]) {
      if (result.error) throw new Error(result.error.message);
    }
    return {
      orders: orders.data ?? [],
      products: products.data ?? [],
      categories: categories.data ?? [],
      content: content.data ?? [],
    };
  });

const productInput = z.object({
  id: z.string().uuid().optional(),
  product_name: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).default(""),
  specifications: z.record(z.string(), z.string()).default({}),
  price: z.number().min(0).max(100_000_000),
  discount_price: z.number().min(0).max(100_000_000).nullable().default(null),
  category_id: z.string().uuid().nullable().default(null),
  brand: z.string().trim().max(100).default(""),
  model: z.string().trim().max(100).default(""),
  stock: z.number().int().min(0).max(1_000_000),
  image_url: z.string().trim().max(2000).nullable().default(null),
  processor: z.string().trim().max(100).nullable().default(null),
  ram: z.string().trim().max(50).nullable().default(null),
  storage: z.string().trim().max(50).nullable().default(null),
  is_featured: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_special_offer: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => productInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("products").update(values).eq("id", id)
      : context.supabase.from("products").insert(values);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const categoryInput = z.object({
  id: z.string().uuid().optional(),
  category_name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120),
  icon: z.string().trim().max(16).default(""),
  description: z.string().trim().max(500).default(""),
  category_image: z.string().trim().max(2000).nullable().default(null),
  card_image: z.string().trim().max(2000).nullable().default(null),
  display_order: z.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => categoryInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("categories").update(values).eq("id", id)
      : context.supabase.from("categories").insert(values);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        order_status: z.enum([
          "new",
          "confirmed",
          "processing",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: updated, error } = await context.supabase
      .from("orders")
      .update({ order_status: data.order_status })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const { notifyOrder } = await import("./email.server");
    await notifyOrder(updated as never, data.order_status);

    return { ok: true };
  });

export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().trim().min(2).max(200),
        body: z.string().trim().max(20000),
        is_published: z.boolean().default(true),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const { error } = await context.supabase.from("site_content").update(values).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createSignedImageUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ path: z.string().min(1).max(300) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: signed, error } = await context.supabase.storage
      .from("product-images")
      .createSignedUrl(data.path, 60 * 60 * 24 * 365 * 5);
    if (error) throw new Error(error.message);
    return { url: signed?.signedUrl ?? null };
  });

export const claimAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("site_content")
      .select("data")
      .eq("content_key", "store-settings")
      .maybeSingle();
    if (settingsError) throw new Error(settingsError.message);

    const allowedEmail = String(
      (settings?.data as Record<string, unknown> | null)?.["admin_email"] ?? "",
    ).toLowerCase();
    const email = String(context.claims?.["email"] ?? "").toLowerCase();
    if (!allowedEmail || email !== allowedEmail) throw new Error("Forbidden");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).min(1).max(200) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("orders").delete().in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true, count: data.ids.length };
  });

export const deleteProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).min(1).max(200) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true, count: data.ids.length };
  });

export const duplicateProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).min(1).max(50) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("products")
      .select("*")
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) throw new Error("Nothing to duplicate.");

    const copies = rows.map((row: Record<string, unknown>) => {
      const {
        id: _id,
        created_at: _createdAt,
        updated_at: _updatedAt,
        product_name,
        slug,
        ...rest
      } = row;
      const suffix = Math.random().toString(36).slice(2, 7);
      return {
        ...rest,
        product_name: `${String(product_name)} (Copy)`,
        slug: `${String(slug).slice(0, 100)}-copy-${suffix}`,
        is_active: false,
      };
    });

    const { error: insertError } = await context.supabase.from("products").insert(copies);
    if (insertError) throw new Error(insertError.message);
    return { ok: true, count: copies.length };
  });
