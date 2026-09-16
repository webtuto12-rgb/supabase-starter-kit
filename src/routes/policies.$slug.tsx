import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { policiesQuery } from "@/lib/queries";

export const Route = createFileRoute("/policies/$slug")({
  loader: async ({ context, params }) => {
    const policies = await context.queryClient.ensureQueryData(policiesQuery);
    const policy = policies.find((item) => item.content_key === params.slug);
    if (!policy) throw notFound();
    return { title: policy.title, summary: policy.body.slice(0, 155) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Policy not found" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — ICT Showroom`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.summary },
      ],
    };
  },
  component: PolicyPage,
  notFoundComponent: PolicyNotFound,
});

function PolicyNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Policy not found</h1>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/policies">All policies</Link>
      </Button>
    </div>
  );
}

function PolicyPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(policiesQuery);
  const policy = data.find((item) => item.content_key === slug);
  if (!policy) return <PolicyNotFound />;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/policies"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" /> All policies
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">{policy.title}</h1>
      <div className="mt-6 space-y-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {policy.body}
      </div>
    </article>
  );
}
