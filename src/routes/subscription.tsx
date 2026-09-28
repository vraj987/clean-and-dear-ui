import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";

export const Route = createFileRoute("/subscription")({
  head: () => ({ meta: [{ title: "BytePe Subscription — BytePe" }, { name: "description", content: "Get the latest phone every year with a simple monthly BytePe subscription." }, { property: "og:title", content: "BytePe Subscription — BytePe" }, { property: "og:description", content: "Get the latest phone every year with a simple monthly BytePe subscription." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  return <PageShell><main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8"><h1 className="font-display text-3xl">BytePe Subscription</h1><p className="mt-4 max-w-2xl text-muted-foreground">Pay a low monthly amount, use the latest device, and upgrade, keep or return it when your plan ends.</p></main></PageShell>;
}
