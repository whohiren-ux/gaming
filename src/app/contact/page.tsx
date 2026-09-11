import { ContactForm } from "@/components/contact/contact-form";
import { BrandName } from "@/components/common/brand-name";
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
              <p>
                <BrandName className="brand-name-inline" />, 107, Avadh Square 1st Floor, Near shell pump, Green city, Jamnagar, 361006 
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">Hours</p>
              <p>10:00 AM - 12:00 AM - Daily</p>
            </div>
         
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
