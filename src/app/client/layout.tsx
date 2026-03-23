import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/client/login");
}

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";

  // Don't wrap login/signup pages with the authenticated layout
  if (pathname === "/client/login" || pathname === "/client/signup") {
    return <>{children}</>;
  }

  // Check if user is authenticated for non-login routes
  let isAuthenticated = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    // Supabase not configured or session missing
  }

  if (!isAuthenticated) {
    redirect("/client/login");
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/client/dashboard"
            className="font-semibold text-base uppercase text-text-primary no-underline"
          >
            ScaleCPG
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-[13px] text-text-secondary hover:text-text-primary font-sans bg-transparent border border-border rounded-lg px-3 py-1.5 cursor-pointer transition-colors hover:bg-bg-secondary"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}
