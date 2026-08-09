import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (await isValidSessionCookieValue(cookie)) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!gate|privacy|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
