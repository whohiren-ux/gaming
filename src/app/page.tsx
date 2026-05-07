import {
  BookingCta,
  FeaturedGames,
  GtaBanner,
  MembershipPreview,
  PricingCards,
  Testimonials,
  TournamentSection,
  WhyChooseUs
} from "@/components/marketing/sections";
import { HeroArena } from "@/components/marketing/hero-arena";
import { getMembershipPlans } from "@/lib/membership-service";
import { getPublicPricing } from "@/lib/setup-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [pricing, plans] = await Promise.all([getPublicPricing(), getMembershipPlans()]);

  return (
    <main>
      <HeroArena />
      <FeaturedGames />
      <WhyChooseUs />
      <PricingCards pricing={pricing} />
      <GtaBanner />
      <TournamentSection />
      <MembershipPreview plans={plans} />
      <Testimonials />
      <BookingCta />
    </main>
  );
}
