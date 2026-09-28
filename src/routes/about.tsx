import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About BytePe — BytePe" }, { name: "description", content: "BytePe is a subscription-based tech store with easy EMI on the latest gadgets." }, { property: "og:title", content: "About BytePe — BytePe" }, { property: "og:description", content: "BytePe is a subscription-based tech store with easy EMI on the latest gadgets." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  return <PageShell><main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8"><h1 className="font-display text-3xl">About BytePe</h1><p className="mt-4 max-w-2xl text-muted-foreground">BytePe makes the latest tech affordable with simple EMIs, subscriptions and fast delivery across India.</p></main></PageShell>;
}
