import Link from "next/link";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-lg border-b border-[#E5E7EB]">
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center gap-8">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-[-0.01em] text-[#111111] no-underline"
        >
          ScaleCPG
        </Link>
        <Link
          href="/login"
          className="text-[14px] text-[#6B7280] hover:text-[#111111] transition-colors no-underline"
        >
          app.scalecpg
        </Link>
      </div>
    </nav>
  );
}
