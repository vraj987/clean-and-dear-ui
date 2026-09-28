import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — BytePe" }, { name: "description", content: "Sign in to view your BytePe profile and orders." }, { property: "og:title", content: "Login — BytePe" }, { property: "og:description", content: "Sign in to view your BytePe profile and orders." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <PageShell>
      <main className="mx-auto flex max-w-[1400px] flex-col items-center justify-center px-4 py-16 md:px-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-display text-3xl">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter your details to sign in to your account</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <Input id="email" placeholder="name@example.com" type="text" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full rounded-full bg-logo hover:bg-logo/90">Sign In</Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="rounded-full">Google</Button>
            <Button variant="outline" className="rounded-full">Apple</Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </main>
    </PageShell>
  );
}
