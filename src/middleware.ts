import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  let user = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    supabaseUrl &&
    anonKey &&
    !supabaseUrl.includes("[") &&
    supabaseUrl.startsWith("http")
  ) {
    try {
      const supabase = createServerClient(supabaseUrl, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // In case supabase auth is unavailable during local testing
    }
  }

  const path = request.nextUrl.pathname;

  // Allow unauthenticated access to /admin/login
  if (path === "/admin/login") {
    if (user) {
      const role = user.user_metadata?.role;
      const url = request.nextUrl.clone();
      url.pathname = role === "ADMIN" ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protect Admin routes
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
    const role = user.user_metadata?.role;
    if (role && role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Protect Talent routes
  const protectedTalentPaths = [
    "/dashboard",
    "/profile",
    "/verification",
    "/attendance",
  ];

  if (protectedTalentPaths.some((p) => path.startsWith(p))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated user away from public login/register/admin/login
  if (user && (path === "/login" || path === "/register" || path === "/admin/login")) {
    const role = user.user_metadata?.role;
    const url = request.nextUrl.clone();
    url.pathname = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
