import { ContactForm } from "@/components/contact/contact-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <main className="container py-12">
      <Badge variant="outline">Contact</Badge>
      <h1 className="mt-4 text-4xl font-black tracking-normal text-white">Talk to the front desk</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Messages become dashboard alerts, so staff can respond without leaving the operating system.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ContactForm />
        <Card>
          <CardContent className="space-y-4 p-5 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-white">Address</p>
              <p>Neon Nexus Gaming Cafe, Main Floor, Esports Lane</p>
            </div>
            <div>
              <p className="font-semibold text-white">Hours</p>
              <p>11:00 AM - 1:00 AM</p>
            </div>
            <div>
              <p className="font-semibold text-white">Payments</p>
              <p>Razorpay, UPI, cash, card, and membership credit.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
