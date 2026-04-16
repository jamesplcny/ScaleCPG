import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/brand/signup",
  "/brand/confirm-email",
  "/auth/callback",
  "/pricing",
];

function isPublicRoute(pathname: string) {
  return (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/widget/") ||
    pathname.startsWith("/api/")
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth session if it exists
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  console.log("[middleware]", pathname, "user:", user?.id ?? "NONE", "authError:", authError?.message ?? "none");

  // Unauthenticated user hitting a protected route
  if (!user && !isPublicRoute(pathname)) {
    console.log("[middleware] REDIRECT to /login — no user on protected route:", pathname);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    // Carry over any refreshed auth cookies so the session isn't lost
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value);
    });
    return redirect;
  }

  // Set x-pathname header for layout to read
  supabaseResponse.headers.set("x-pathname", pathname);

  return supabaseResponse;
}
