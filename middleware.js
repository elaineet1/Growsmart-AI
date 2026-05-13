// middleware.js
// Redirects unauthenticated users to /login for all protected routes

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/content/:path*",
    "/leads/:path*",
    "/chatbot/:path*",
    "/ops/:path*",
  ],
};
