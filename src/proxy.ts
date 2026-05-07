import { withAuth } from "next-auth/middleware";

import { isAdminRole } from "@/lib/access-control";

export default withAuth({
  pages: {
    signIn: "/login"
  },
  callbacks: {
    authorized({ token, req }) {
      const pathname = req.nextUrl.pathname;

      if (pathname.startsWith("/admin")) {
        return isAdminRole(token?.role);
      }

      if (pathname.startsWith("/account")) {
        return Boolean(token);
      }

      return true;
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"]
};
