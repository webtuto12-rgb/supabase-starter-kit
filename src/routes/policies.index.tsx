import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { policiesQuery } from "@/lib/queries";

export const Route = createFileRoute("/policies/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(policiesQuery),
  head: () => ({
    meta: [
      { title: "Store Policies — ICT Showroom" },
      {
        name: "description",
        content:
          "Read our refund, return, warranty, delivery and privacy policies plus terms and conditions.",
      },
      { property: "og:title", content: "Store Policies — ICT Showroom" },
      { property: "og:description", content: "Refund, return, warranty and delivery policies." },
    ],
  }),
  component: PoliciesIndex,
});

function PoliciesIndex() {
  const { data } = useSuspenseQuery(policiesQuery);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Store policies</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything about refunds, returns, warranty and delivery in plain language.
      </p>
      <ul className="mt-6 space-y-3">
        {data.map((policy) => (
          <li key={policy.content_key}>
            <Link
              to="/policies/$slug"
              params={{ slug: policy.content_key }}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/50"
            >
              <span className="font-semibold">{policy.title}</span>
              <ArrowRight className="size-4 text-accent" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
