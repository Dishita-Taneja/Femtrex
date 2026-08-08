import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/funding-intelligence",
  "/business-passport",
  "/mentor-network",
  "/ai-founder-copilot",
  "/micro-mentorship",
  "/resources",
  "/profile",
  "/settings",
  "/mentor-apply",
  "/mentor-dashboard",
];

export function middleware(request: NextRequest) {
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("x-femtrex-route", "protected-demo-ready");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/funding-intelligence/:path*",
    "/business-passport/:path*",
    "/mentor-network/:path*",
    "/ai-founder-copilot/:path*",
    "/micro-mentorship/:path*",
    "/resources/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/mentor-apply/:path*",
    "/mentor-dashboard/:path*",
  ],
};
