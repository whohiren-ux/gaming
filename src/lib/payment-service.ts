import crypto from "crypto";

import { Prisma, type PaymentMethod, type PaymentStatus, type PaymentType, type PrismaClient } from "@prisma/client";

import { getOptionalEnv } from "@/lib/env";
import { activateMembership } from "@/lib/membership-service";
import { paise, toDecimal, toNumber } from "@/lib/money";
import { createNotification } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";
import { getRazorpay } from "@/lib/razorpay";
import { confirmBookingPayment } from "@/lib/booking-service";

type DbClient = PrismaClient | Prisma.TransactionClient;

export function createInvoiceNumber(prefix = "NNX") {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-INV-${stamp}-${random}`;
}

export async function createLedgerPayment(
  client: DbClient,
  input: {
    bookingId?: string | null;
    sessionId?: string | null;
    membershipId?: string | null;
    userId?: string | null;
    amount: number | Prisma.Decimal;
    method: PaymentMethod;
    type: PaymentType;
    status?: PaymentStatus;
    providerOrderId?: string;
    providerPaymentId?: string;
    providerSignature?: string;
    metadata?: Prisma.InputJsonValue;
    lineItemName?: string;
  }
) {
  const invoiceNumber = createInvoiceNumber();
  const amount = toDecimal(input.amount);

  const payment = await client.payment.create({
    data: {
      invoiceNumber,
      bookingId: input.bookingId ?? null,
      sessionId: input.sessionId ?? null,
      membershipId: input.membershipId ?? null,
      userId: input.userId ?? null,
      amount,
      method: input.method,
      type: input.type,
      status: input.status ?? "PAID",
      providerOrderId: input.providerOrderId,
      providerPaymentId: input.providerPaymentId,
      providerSignature: input.providerSignature,
      metadata: input.metadata ?? Prisma.JsonNull
    }
  });

  await client.invoice.create({
    data: {
      invoiceNumber,
      paymentId: payment.id,
      bookingId: input.bookingId ?? null,
      sessionId: input.sessionId ?? null,
      userId: input.userId ?? null,
      status: payment.status === "PAID" ? "PAID" : "ISSUED",
      subtotal: amount,
      taxAmount: toDecimal(0),
      total: amount,
      paidAt: payment.status === "PAID" ? new Date() : null,
      lineItems: [
        {
          name: input.lineItemName || input.type.replaceAll("_", " "),
          amount: toNumber(amount),
          quantity: 1
        }
      ]
    }
  });

  return payment;
}

export async function createRazorpayOrder(input: {
  userId: string;
  bookingId?: string;
  sessionId?: string;
  membershipId?: string;
  membershipPlanId?: string;
  amount: number;
  paymentType: PaymentType;
}) {
  const razorpay = getRazorpay();
  const receipt = createInvoiceNumber("NNX-RZP");

  const order = await razorpay.orders.create({
    amount: paise(input.amount),
    currency: "INR",
    receipt,
    notes: {
      bookingId: input.bookingId ?? "",
      sessionId: input.sessionId ?? "",
      membershipId: input.membershipId ?? "",
      membershipPlanId: input.membershipPlanId ?? "",
      userId: input.userId,
      paymentType: input.paymentType
    }
  });

  const payment = await prisma.$transaction(async (tx) =>
    createLedgerPayment(tx, {
      bookingId: input.bookingId,
      sessionId: input.sessionId,
      membershipId: input.membershipId,
      userId: input.userId,
      amount: input.amount,
      method: "RAZORPAY",
      type: input.paymentType,
      status: "PENDING",
      providerOrderId: order.id,
      metadata: {
        razorpayOrderId: order.id,
        razorpayReceipt: order.receipt,
        razorpayAmount: order.amount,
        membershipPlanId: input.membershipPlanId
      },
      lineItemName: `${input.paymentType.toLowerCase()} payment`
    })
  );

  await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.paymentChanged, {
    paymentId: payment.id,
    status: payment.status
  });

  return {
    order,
    payment
  };
}

export function verifyRazorpayWebhook(rawBody: string, signature: string | null) {
  const secret = getOptionalEnv("RAZORPAY_WEBHOOK_SECRET");
  if (!secret || !signature) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyRazorpayCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = getOptionalEnv("RAZORPAY_KEY_SECRET");
  if (!secret) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  if (expected.length !== input.signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
}

export async function confirmRazorpayCheckoutPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (
    !verifyRazorpayCheckoutSignature({
      orderId: input.orderId,
      paymentId: input.paymentId,
      signature: input.signature
    })
  ) {
    throw new Error("Invalid Razorpay payment signature.");
  }

  const payment = await prisma.payment.findFirstOrThrow({
    where: { providerOrderId: input.orderId }
  });

  if (payment.status === "PAID") {
    return payment;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        providerPaymentId: input.paymentId,
        providerSignature: input.signature
      }
    });

    await tx.invoice.updateMany({
      where: { paymentId: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });
  });

  if (payment.bookingId) {
    await confirmBookingPayment(payment.bookingId, toNumber(payment.amount), "RAZORPAY");
  }

  if (payment.type === "MEMBERSHIP" && payment.userId) {
    const metadata = payment.metadata as { membershipPlanId?: string } | null;

    if (metadata?.membershipPlanId) {
      const membership = await activateMembership({
        userId: payment.userId,
        planId: metadata.membershipPlanId
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { membershipId: membership.id }
      });
    }
  }

  await createNotification({
    userId: payment.userId,
    type: "PAYMENT_SUCCESS",
    title: "Payment successful",
    message: `Payment ${payment.invoiceNumber} was verified successfully.`,
    metadata: {
      paymentId: payment.id,
      amount: toNumber(payment.amount)
    }
  });

  await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.paymentChanged, {
    paymentId: payment.id,
    status: "PAID"
  });

  return prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
}

export async function handleRazorpayWebhook(rawBody: string) {
  const event = JSON.parse(rawBody) as {
    event: string;
    payload?: {
      payment?: {
        entity?: {
          id: string;
          order_id: string;
          amount: number;
          status: string;
          captured: boolean;
        };
      };
    };
  };

  const entity = event.payload?.payment?.entity;

  if (!entity?.order_id) {
    return { handled: false };
  }

  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: entity.order_id },
    include: { booking: true }
  });

  if (!payment) {
    return { handled: false };
  }

  if (event.event === "payment.captured" || entity.captured) {
    const amount = entity.amount / 100;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          providerPaymentId: entity.id
        }
      });

      await tx.invoice.updateMany({
        where: { paymentId: payment.id },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      });
    });

    if (payment.bookingId) {
      await confirmBookingPayment(payment.bookingId, amount, "RAZORPAY");
    }

    if (payment.type === "MEMBERSHIP" && payment.userId) {
      const metadata = payment.metadata as { membershipPlanId?: string } | null;

      if (metadata?.membershipPlanId) {
        const membership = await activateMembership({
          userId: payment.userId,
          planId: metadata.membershipPlanId
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: { membershipId: membership.id }
        });
      }
    }

    await createNotification({
      userId: payment.userId,
      type: "PAYMENT_SUCCESS",
      title: "Payment received",
      message: `Payment ${payment.invoiceNumber} was captured successfully.`,
      metadata: {
        paymentId: payment.id,
        amount
      }
    });

    await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.paymentChanged, {
      paymentId: payment.id,
      status: "PAID"
    });

    return { handled: true };
  }

  if (event.event === "payment.failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", providerPaymentId: entity.id }
    });

    await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.paymentChanged, {
      paymentId: payment.id,
      status: "FAILED"
    });

    return { handled: true };
  }

  return { handled: false };
}
