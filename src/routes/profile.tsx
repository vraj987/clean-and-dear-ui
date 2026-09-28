import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User, MapPin, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — BytePe" }, { name: "description", content: "View your BytePe profile, orders and subscriptions." }] }),
  component: Page,
});

function Page() {
  const orders = [
    { id: "BP-10293", date: "Jan 15, 2024", total: "₹49,999", status: "Delivered", item: "Samsung Galaxy A57 5G" },
    { id: "BP-10245", date: "Dec 10, 2023", total: "₹4,500", status: "Cancelled", item: "Sony WF-C510" },
  ];

  return (
    <PageShell>
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <h1 className="font-display text-3xl">My Account</h1>
        
        <Tabs defaultValue="profile" className="mt-8 flex flex-col gap-8 md:flex-row">
          <TabsList className="flex h-auto w-full flex-col items-start justify-start bg-transparent md:w-64">
            <TabsTrigger value="profile" className="w-full justify-start gap-3 rounded-md px-4 py-2 data-[state=active]:bg-muted">
              <User className="size-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="w-full justify-start gap-3 rounded-md px-4 py-2 data-[state=active]:bg-muted">
              <Package className="size-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="w-full justify-start gap-3 rounded-md px-4 py-2 data-[state=active]:bg-muted">
              <MapPin className="size-4" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start gap-3 rounded-md px-4 py-2 data-[state=active]:bg-muted">
              <Settings className="size-4" /> Settings
            </TabsTrigger>
            <Button variant="ghost" className="mt-4 w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="size-4" /> Logout
            </Button>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details and how we reach you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Full Name</p>
                      <p>Aanya Sharma</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                      <p>aanya.sharma@example.com</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
                      <p>+91 98765 43210</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>Manage and track your recent orders.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex flex-col justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center">
                        <div>
                          <p className="font-semibold">{order.item}</p>
                          <p className="text-sm text-muted-foreground">Order ID: {order.id} • {order.date}</p>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="font-medium">{order.total}</p>
                            <span className={cn(
                              "text-xs font-semibold",
                              order.status === "Delivered" ? "text-success" : "text-destructive"
                            )}>
                              {order.status}
                            </span>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>Manage your delivery addresses.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-4">
                    <p className="font-semibold">Home</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Jbr Tech Park, Plot No. 77, 6th Rd,<br />
                      EPIP Zone, Whitefield, Bengaluru,<br />
                      Karnataka 560066
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                  <Button className="mt-6 w-full sm:w-auto" variant="outline">+ Add New Address</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your security and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates about your orders.</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security.</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </PageShell>
  );
}
