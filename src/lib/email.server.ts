import { DELIVERY_CHARGE } from "./store";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "ICT Showroom <onboarding@resend.dev>";
const FALLBACK_ADMIN_EMAIL = "ameerjezme@gmail.com";

export type EmailOrder = {
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city?: string | null;
  notes?: string | null;
  products: { name: string; quantity: number; price: number }[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method?: string | null;
  order_status?: string | null;
  created_at?: string | null;
};

const STATUS_COPY: Record<string, { title: string; message: string }> = {
  new: {
    title: "Order received",
    message: "Thank you for your order! We have received it and will contact you shortly.",
  },
  confirmed: {
    title: "Order confirmed",
    message: "Your order is confirmed and being prepared.",
  },
  processing: {
    title: "Order is being processed",
    message: "We are packing your items now.",
  },
  out_for_delivery: {
    title: "Out for delivery",
    message: "Your order is on the way. Please keep the cash payment ready.",
  },
  delivered: {
    title: "Order delivered",
    message: "Your order has been delivered. Thank you for shopping with us!",
  },
  cancelled: {
    title: "Order cancelled",
    message: "Your order has been cancelled. Contact us on WhatsApp if this was a mistake.",
  },
};

function money(value: number) {
  return `LKR ${Number(value || 0).toLocaleString("en-LK")}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function orderHtml(order: EmailOrder, heading: string, message: string, forAdmin: boolean) {
  const rows = (order.products ?? [])
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.name)} × ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${money(item.price * item.quantity)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f7fe;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbe6fb;">
    <div style="background:#1d4ed8;padding:22px 24px;color:#ffffff;">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.85;">ICT Showroom</div>
      <div style="font-size:22px;font-weight:bold;margin-top:6px;">${escapeHtml(heading)}</div>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(message)}</p>
      <p style="margin:0 0 18px;font-size:14px;"><strong>Order number:</strong> #${escapeHtml(order.order_number)}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
        <tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;">${money(order.subtotal)}</td></tr>
        <tr><td style="padding:4px 0;">Delivery charge</td><td style="padding:4px 0;text-align:right;">${money(order.delivery_charge ?? DELIVERY_CHARGE)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;border-top:1px solid #e5e7eb;">Total payable</td><td style="padding:8px 0;text-align:right;font-weight:bold;border-top:1px solid #e5e7eb;">${money(order.total)}</td></tr>
      </table>

      <div style="margin-top:22px;padding:16px;border-radius:12px;background:#f4f7fe;font-size:14px;line-height:1.7;">
        <strong>${forAdmin ? "Customer details" : "Delivery details"}</strong><br/>
        ${escapeHtml(order.customer_name)}<br/>
        ${escapeHtml(order.phone)}<br/>
        ${order.email ? `${escapeHtml(order.email)}<br/>` : ""}
        ${escapeHtml(order.address)}${order.city ? `, ${escapeHtml(order.city)}` : ""}<br/>
        Payment: ${escapeHtml(order.payment_method || "Cash on Delivery")}
        ${order.notes ? `<br/>Notes: ${escapeHtml(order.notes)}` : ""}
      </div>

      <p style="margin:22px 0 0;font-size:13px;color:#64748b;">
        Questions? WhatsApp or call 071 067 2207.
      </p>
    </div>
  </div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    console.error("Email skipped: Resend is not configured.");
    return;
  }

  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend request failed [${response.status}]: ${body}`);
  }
}

async function adminEmail() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("site_content")
      .select("data")
      .eq("content_key", "store-settings")
      .maybeSingle();
    const email = String((data?.data as Record<string, unknown> | null)?.["admin_email"] ?? "");
    return email || FALLBACK_ADMIN_EMAIL;
  } catch {
    return FALLBACK_ADMIN_EMAIL;
  }
}

/** Fire-and-forget order notifications; never throws into the caller. */
export async function notifyOrder(order: EmailOrder, status: string) {
  try {
    const copy = STATUS_COPY[status] ?? STATUS_COPY["new"]!;
    const admin = await adminEmail();

    const tasks: Promise<void>[] = [];

    if (order.email) {
      tasks.push(
        sendEmail(
          order.email,
          `${copy.title} — #${order.order_number}`,
          orderHtml(order, copy.title, copy.message, false),
        ),
      );
    }

    const adminHeading =
      status === "new" ? `New order #${order.order_number}` : `${copy.title} — #${order.order_number}`;
    const adminMessage =
      status === "new"
        ? "A new order was placed on the website."
        : `Order status changed to: ${copy.title}.`;
    tasks.push(sendEmail(admin, adminHeading, orderHtml(order, adminHeading, adminMessage, true)));

    await Promise.all(tasks);
  } catch (error) {
    console.error("Order notification failed", error);
  }
}
