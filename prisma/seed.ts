import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString })
});

const price = (value: number) => new Prisma.Decimal(value);

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  const customerPasswordHash = await bcrypt.hash("Player@12345", 12);

  await prisma.user.upsert({
    where: { email: "admin@neonnexus.local" },
    update: {},
    create: {
      name: "Neon Nexus Admin",
      email: "admin@neonnexus.local",
      phone: "+919999999901",
      role: "ADMIN",
      passwordHash
    }
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@neonnexus.local" },
    update: {},
    create: {
      name: "Front Desk Staff",
      email: "staff@neonnexus.local",
      phone: "+919999999902",
      role: "STAFF",
      passwordHash
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: "player@neonnexus.local" },
    update: {},
    create: {
      name: "Aarav Player",
      email: "player@neonnexus.local",
      phone: "+919999999903",
      role: "CUSTOMER",
      passwordHash: customerPasswordHash,
      loyaltyPoints: 250
    }
  });

  const setups = [
    {
      stationCode: "PS5-01",
      name: "PS5 Arena 01",
      type: "PS5" as const,
      hourlyPrice: price(350),
      displayOrder: 1,
      specs: { display: "55in 4K 120Hz OLED", controllers: 2, headset: "Pulse 3D" }
    },
    {
      stationCode: "PS5-02",
      name: "PS5 Arena 02",
      type: "PS5" as const,
      hourlyPrice: price(350),
      displayOrder: 2,
      specs: { display: "55in 4K 120Hz QLED", controllers: 2, headset: "SteelSeries" }
    },
    {
      stationCode: "PS5-03",
      name: "VIP PS5 Pod",
      type: "PS5" as const,
      hourlyPrice: price(500),
      displayOrder: 3,
      specs: { display: "65in OLED", controllers: 4, sound: "Dolby Atmos" }
    },
    {
      stationCode: "PS4-01",
      name: "PS4 Classic 01",
      type: "PS4" as const,
      hourlyPrice: price(220),
      displayOrder: 4,
      specs: { display: "43in 1080p", controllers: 2 }
    },
    {
      stationCode: "PS4-02",
      name: "PS4 Classic 02",
      type: "PS4" as const,
      hourlyPrice: price(220),
      displayOrder: 5,
      specs: { display: "43in 1080p", controllers: 2 }
    },
    {
      stationCode: "RW-01",
      name: "Racing Wheel 01",
      type: "GAMING_PC" as const,
      hourlyPrice: price(180),
      displayOrder: 6,
      specs: { wheel: "Logitech G29", pedals: "3-pedal set", display: "55in 4K" }
    },
    {
      stationCode: "RW-02",
      name: "Racing Wheel 02",
      type: "GAMING_PC" as const,
      hourlyPrice: price(180),
      displayOrder: 7,
      specs: { wheel: "Thrustmaster T300 RS", pedals: "T3PA", display: "55in 4K" }
    },
    {
      stationCode: "RW-03",
      name: "Racing Wheel 03",
      type: "GAMING_PC" as const,
      hourlyPrice: price(180),
      displayOrder: 8,
      specs: { wheel: "Logitech G923", pedals: "Trueforce pedals", display: "43in 4K" }
    }
  ];

  for (const setup of setups) {
    await prisma.setup.upsert({
      where: { stationCode: setup.stationCode },
      update: {
        name: setup.name,
        type: setup.type,
        hourlyPrice: setup.hourlyPrice,
        displayOrder: setup.displayOrder,
        specs: setup.specs
      },
      create: setup
    });
  }

  const monthlyPlan = await prisma.membershipPlan.upsert({
    where: { id: "seed-monthly-pro" },
    update: {},
    create: {
      id: "seed-monthly-pro",
      name: "Monthly Pro",
      type: "MONTHLY",
      price: price(3499),
      includedMinutes: 1800,
      discountPercent: 15,
      priorityBooking: true,
      maxDailyMinutes: 180,
      description: "30 hours monthly playtime with priority slots and member pricing."
    }
  });

  await prisma.membershipPlan.upsert({
    where: { id: "seed-vip-night" },
    update: {},
    create: {
      id: "seed-vip-night",
      name: "VIP Night Pass",
      type: "VIP",
      price: price(5999),
      includedMinutes: 3000,
      discountPercent: 25,
      priorityBooking: true,
      maxDailyMinutes: 300,
      description: "VIP pods, late-night access, tournament perks, and best discount tier."
    }
  });

  await prisma.membershipPlan.upsert({
    where: { id: "seed-hours-pack" },
    update: {},
    create: {
      id: "seed-hours-pack",
      name: "10 Hour Pack",
      type: "HOURS",
      price: price(1999),
      includedMinutes: 600,
      discountPercent: 10,
      priorityBooking: false,
      description: "Flexible prepaid hours for casual players."
    }
  });

  await prisma.membership.upsert({
    where: { id: "seed-customer-membership" },
    update: {},
    create: {
      id: "seed-customer-membership",
      userId: customer.id,
      planId: monthlyPlan.id,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      remainingMinutes: 1380
    }
  });

  const ps5One = await prisma.setup.findUniqueOrThrow({ where: { stationCode: "PS5-01" } });
  const racingWheelTwo = await prisma.setup.findUniqueOrThrow({ where: { stationCode: "RW-02" } });

  const activeSession = await prisma.setupSession.upsert({
    where: { id: "seed-active-session" },
    update: {},
    create: {
      id: "seed-active-session",
      setupId: ps5One.id,
      customerId: customer.id,
      status: "ACTIVE",
      startedAt: new Date(Date.now() - 1000 * 60 * 48),
      endsAt: new Date(Date.now() + 1000 * 60 * 42),
      ratePerHour: ps5One.hourlyPrice,
      billedAmount: price(350),
      paidAmount: price(350),
      createdById: staff.id,
      notes: "Seeded active session for realtime dashboard preview."
    }
  });

  await prisma.setup.update({
    where: { id: ps5One.id },
    data: { status: "ACTIVE", lastSeenAt: new Date() }
  });

  await prisma.booking.upsert({
    where: { reference: "NNX-SEED-BOOKING" },
    update: {},
    create: {
      reference: "NNX-SEED-BOOKING",
      setupId: racingWheelTwo.id,
      customerId: customer.id,
      setupType: racingWheelTwo.type,
      status: "CONFIRMED",
      source: "ONLINE",
      startTime: new Date(Date.now() + 1000 * 60 * 90),
      endTime: new Date(Date.now() + 1000 * 60 * 210),
      durationMinutes: 120,
      bufferMinutes: racingWheelTwo.bufferMinutes,
      priceTotal: price(360),
      tokenAmount: price(100),
      paidAmount: price(100),
      paymentStatus: "PARTIAL",
      paymentMode: "RAZORPAY",
      qrPayload: "NNX-SEED-BOOKING"
    }
  });

  await prisma.payment.upsert({
    where: { invoiceNumber: "NNX-INV-SEED-001" },
    update: {},
    create: {
      invoiceNumber: "NNX-INV-SEED-001",
      sessionId: activeSession.id,
      userId: customer.id,
      amount: price(350),
      status: "PAID",
      method: "CASH",
      type: "WALK_IN",
      metadata: { seed: true }
    }
  });

  await prisma.tournament.upsert({
    where: { id: "seed-fifa-night" },
    update: {},
    create: {
      id: "seed-fifa-night",
      title: "Friday FC 26 Knockout",
      game: "EA Sports FC 26",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      entryFee: price(250),
      prizePool: price(5000),
      maxPlayers: 32,
      description: "Single-elimination console tournament with live bracket updates.",
      rules: "Standard 6-minute halves. Final uses best of three."
    }
  });

  await prisma.analyticsSnapshot.upsert({
    where: { date: new Date(new Date().toISOString().slice(0, 10)) },
    update: {},
    create: {
      date: new Date(new Date().toISOString().slice(0, 10)),
      dailyRevenue: price(350),
      onlineRevenue: price(100),
      walkInRevenue: price(350),
      occupancyPercent: price(38.5),
      activeMinutes: 48,
      totalBookings: 1,
      bookingConversions: 1,
      peakHour: 20,
      mostUsedSetupId: ps5One.id
    }
  });

  console.log("Seed complete");
  console.log("Admin login: admin@neonnexus.local / Admin@12345");
  console.log("Customer login: player@neonnexus.local / Player@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
