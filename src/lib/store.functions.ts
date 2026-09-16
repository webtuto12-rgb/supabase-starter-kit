import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicServerClient } from "./supabase-public";
import { DELIVERY_CHARGE } from "./store";

const PRODUCT_COLUMNS =
  "id, product_name, slug, description, specifications, price, discount_price, category_id, brand, model, stock, image_url, images, processor, ram, storage, is_featured, is_best_seller, is_new_arrival, is_special_offer";

const CATEGORY_COLUMNS =
  "id, category_name, slug, icon, description, category_image, card_image, display_order";

export const getStorefront = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicServerClient();

  const [categories, products, content] = await Promise.all([
    supabase
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase.from("site_content").select("content_key, title, body, data").eq("is_published", true),
  ]);

  if (categories.error) throw new Error(categories.error.message);
  if (products.error) throw new Error(products.error.message);

  return {
    categories: categories.data ?? [],
    products: products.data ?? [],
    content: content.data ?? [],
  };
});

export const getPolicies = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("content_key, title, body, display_order")
    .eq("content_type", "policy")
    .eq("is_published", true)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

const orderInput = z.object({
  customer_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255).or(z.literal("")),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().max(100),
  notes: z.string().trim().max(1000),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderInput.parse(data))
  .handler(async ({ data }) => {
    const supabase = createPublicServerClient();

    const ids = data.items.map((item) => item.id);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, product_name, slug, price, discount_price, image_url")
      .in("id", ids)
      .eq("is_active", true);

    if (productError) throw new Error(productError.message);
    if (!products || products.length === 0) throw new Error("No valid products in this order.");

    const lineItems = data.items
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        if (!product) return null;
        const price =
          product.discount_price && product.discount_price > 0
            ? Number(product.discount_price)
            : Number(product.price);
        return {
          id: product.id,
          name: product.product_name,
          slug: product.slug,
          price,
          quantity: item.quantity,
          image_url: product.image_url,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (lineItems.length === 0) throw new Error("No valid products in this order.");

    const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + DELIVERY_CHARGE;

    // Insert with the service-role client: the anon role may insert but cannot
    // read orders back, and PostgREST needs to return the new row's id.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        notes: data.notes,
        products: lineItems,
        subtotal,
        delivery_charge: DELIVERY_CHARGE,
        total,
        payment_method: "Cash on Delivery",
        order_status: "new",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return order;
  });
