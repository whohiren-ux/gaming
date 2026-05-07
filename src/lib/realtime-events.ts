export const REALTIME_CHANNELS = {
  availability: "public-availability",
  admin: "private-admin-dashboard",
  notifications: "private-notifications"
} as const;

export const REALTIME_EVENTS = {
  availabilityChanged: "availability:changed",
  sessionChanged: "session:changed",
  bookingChanged: "booking:changed",
  paymentChanged: "payment:changed",
  notificationCreated: "notification:created",
  analyticsChanged: "analytics:changed"
} as const;
