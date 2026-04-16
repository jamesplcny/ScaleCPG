export function LandingFooter() {
  return (
    <footer className="border-t border-[#E5E7EB]">
      <div className="max-w-[1120px] mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[14px] font-semibold text-[#111111] tracking-[-0.01em]">
          ScaleCPG
        </span>
        <p className="text-[13px] text-[#9CA3AF]">
          &copy; {new Date().getFullYear()} ScaleCPG. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
