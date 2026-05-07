import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicPricing } from "@/lib/setup-service";
import { formatINR } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const pricing = await getPublicPricing();

  return (
    <main className="container py-12">
      <Badge variant="outline">Pricing</Badge>
      <h1 className="mt-4 text-4xl font-black tracking-normal text-white">Transparent lounge rates</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Rates are driven by the setup table, so admin pricing changes flow into online booking.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {pricing.map((item) => (
          <Card key={item.type}>
            <CardHeader>
              <CardTitle>{item.type.replace("_", " ")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-white">{formatINR(item.minHourlyPrice)}/hr</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {item.setupCount} setups · peak pods up to {formatINR(item.maxHourlyPrice)}/hr
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
