import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*", "/freelancer-dashboard/:path*", "/profile/:path*", "/login/:path*", "/register/:path*", "/tes-kesiapan-digital/mulai"],
};
