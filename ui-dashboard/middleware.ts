import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { posthogAssetsHost, posthogHost } from "./lib/posthog";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const middleware = async (request: NextRequest) => {
  // Initialize headers and add the API token
  const requestHeaders = new Headers(request.headers);

  const { origin, pathname } = request.nextUrl;

  if (pathname.startsWith("/api") && process.env.API_TOKEN) {
    // add x-api-token for infra auth purposes
    requestHeaders.set("x-app-token", process.env.API_TOKEN);
  }

  // Handle PostHog ingestion routes
  if (pathname.startsWith("/relay-gp-ph")) {
    const url = request.nextUrl.clone();
    const hostname = url.pathname.startsWith("/relay-gp-ph/static/")
      ? posthogAssetsHost
      : posthogHost;

    requestHeaders.set("host", hostname);

    url.protocol = "https";
    url.hostname = hostname;
    url.port = "443";
    url.pathname = url.pathname.replace(/^\/relay-gp-ph/, "");

    return NextResponse.rewrite(url, {
      headers: requestHeaders,
    });
  }

  // Handle open routes
  if (
    !pathname.startsWith("/signin") &&
    !pathname.startsWith("/signup") &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/verify-request") &&
    !pathname.startsWith("/activation/choose-partner")
  ) {
    const redirectToConnect = () => {
      const redirectUrl = new URL("/signin", origin);
      redirectUrl.searchParams.append("next", pathname);
      return NextResponse.redirect(redirectUrl);
    };

    const authSession = await auth();

    if (!authSession) {
      return redirectToConnect();
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
};

export const config = {
  matcher: [
    // Original auth matchers
    "/((?!_next/image|_next/static|static|favicon.ico|sentry-tunnel).*)",
    // PostHog ingest matcher
    "/relay-gp-ph/:path*",
  ],
};

export default middleware;
