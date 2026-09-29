import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Revisión rápida: sin cookie de sesión no se entra al panel.
// La verificación real de la firma se hace en cada página y acción.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.get("tecnova_admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
