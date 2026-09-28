import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — BytePe" }, { name: "description", content: "View your BytePe profile, orders and subscriptions." }, { property: "og:title", content: "My Profile — BytePe" }, { property: "og:description", content: "View your BytePe profile, orders and subscriptions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  return <PageShell><main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8"><h1 className="font-display text-3xl">My Profile</h1><p className="mt-4 text-muted-foreground">Sign-in is not available in this demo.</p></main></PageShell>;
}
