import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Inter } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Script from "next/script";
import { Sidebar } from "@/components/layout/Sidebar";
import { NAV_ITEMS, BRAND_NAV_ITEMS, EXTRA_PROTECTED_ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const GA_ID = "G-KE7VTMTMPY";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ScaleCPG — Manufacturing Suite",
  description: "Cosmetic manufacturing management dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isAuthenticated = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    // Supabase not configured or session missing
  }

  // Read pathname from middleware header to determine layout
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";

  // Determine if this is a protected portal route
  const isAdminRoute = pathname.startsWith("/admin");
  const isExtraProtected = EXTRA_PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isMfgRoute = NAV_ITEMS.some((item) => pathname.startsWith(item.href));
  const isBrandRoute = BRAND_NAV_ITEMS.some((item) => pathname.startsWith(item.href));
  const isProtectedRoute = isMfgRoute || isBrandRoute || isExtraProtected;

  // Redirect unauthenticated users away from protected routes
  // This prevents the login page from rendering inside the portal layout
  if (!isAuthenticated && isProtectedRoute) {
    redirect("/login");
  }

  const showSidebar = isAuthenticated && isProtectedRoute && !isAdminRoute;

  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className={`${cormorant.variable} ${outfit.variable} ${inter.variable} antialiased`}>
        {showSidebar && (
          <Sidebar portal={isBrandRoute ? "brand" : "manufacturer"} />
        )}
        <main className={showSidebar ? "ml-[260px] p-8 min-h-screen max-lg:ml-0 max-lg:p-5" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
