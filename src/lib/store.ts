export const DELIVERY_CHARGE = 500;
export const WHATSAPP_NUMBER = "94710672207";
export const CURRENCY = "LKR";

export type Category = {
  id: string;
  category_name: string;
  slug: string;
  icon: string;
  description: string;
  category_image: string | null;
  card_image: string | null;
  display_order: number;
};

export type Product = {
  id: string;
  product_name: string;
  slug: string;
  description: string;
  specifications: Record<string, string> | null;
  price: number;
  discount_price: number | null;
  category_id: string | null;
  brand: string;
  model: string;
  stock: number;
  image_url: string | null;
  images: string[];
  processor: string | null;
  ram: string | null;
  storage: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_special_offer: boolean;
  is_active?: boolean;
};

export type OrderItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image_url?: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  products: OrderItem[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  order_status: string;
  created_at: string;
};

export function formatPrice(value: number): string {
  return `${CURRENCY} ${Math.round(value).toLocaleString("en-LK")}`;
}

export function effectivePrice(product: {
  price: number;
  discount_price: number | null;
}): number {
  return product.discount_price && product.discount_price > 0
    ? product.discount_price
    : product.price;
}

export function discountPercent(product: {
  price: number;
  discount_price: number | null;
}): number | null {
  if (!product.discount_price || product.discount_price >= product.price) return null;
  return Math.round(((product.price - product.discount_price) / product.price) * 100);
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productWhatsappMessage(product: Product, quantity = 1): string {
  return [
    "Hello, I would like to place an order.",
    "",
    `Product: ${product.product_name}`,
    `Quantity: ${quantity}`,
    `Price: ${formatPrice(effectivePrice(product) * quantity)}`,
    "",
    "Customer Name:",
    "Phone:",
    "Delivery Address:",
    "",
    "Thank you.",
  ].join("\n");
}

export function cartWhatsappMessage(
  items: OrderItem[],
  subtotal: number,
  customer?: { name?: string; phone?: string; address?: string },
): string {
  const lines = [
    "Hello, I would like to place an order.",
    "",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.name} x ${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
    ),
    "",
    `Product Total: ${formatPrice(subtotal)}`,
    `Delivery: ${formatPrice(DELIVERY_CHARGE)}`,
    `Final Total: ${formatPrice(subtotal + DELIVERY_CHARGE)}`,
    "",
    `Customer Name: ${customer?.name ?? ""}`,
    `Phone: ${customer?.phone ?? ""}`,
    `Delivery Address: ${customer?.address ?? ""}`,
    "",
    "Thank you.",
  ];
  return lines.join("\n");
}

export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "New order",
  confirmed: "Confirmed",
  processing: "Processing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
