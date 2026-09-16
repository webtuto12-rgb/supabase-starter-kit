import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/store";

type Props = {
  message: string;
  label?: string;
  className?: string;
};

export function WhatsAppButton({ message, label = "Order on WhatsApp", className }: Props) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-success px-5 py-3 text-sm font-semibold text-success-foreground transition-transform hover:scale-[1.03] active:scale-100",
        className,
      )}
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      {label}
    </a>
  );
}

export function WhatsAppFloating({ message }: { message: string }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="no-print fixed bottom-5 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" aria-hidden="true" />
    </a>
  );
}
