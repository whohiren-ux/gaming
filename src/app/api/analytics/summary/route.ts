import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertRole } from "@/lib/access-control";
import { getAnalyticsDeepDive } from "@/lib/analytics-service";

export async function GET() {
  try {
    const session = await auth();
    assertRole(session, ["ADMIN", "STAFF"]);
    const analytics = await getAnalyticsDeepDive();
    return ok({ analytics });
  } catch (error) {
    return apiError(error);
  }
}
