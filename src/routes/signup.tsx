import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup" as any)({
  head: () => ({ meta: [{ title: "Sign Up — BytePe" }] }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <PageShell>
      <main className="mx-auto flex max-w-[1400px] flex-col items-center justify-center px-4 py-16 md:px-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-display text-3xl">Create Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Join BytePe and get the latest tech on easy EMI</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" type="text" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="name@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+91 XXXXX XXXXX" type="tel" />
            </div>
            <Button className="w-full rounded-full bg-logo hover:bg-logo/90">Create Account</Button>
          </div>
          <p className="px-8 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </PageShell>
  );
}
