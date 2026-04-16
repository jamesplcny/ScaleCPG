"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

export function GetStartedModal({ onClose }: { onClose: () => void }) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div className="relative w-full max-w-2xl h-[90vh] bg-white rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.25)] flex flex-col">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors"
          >
            <X className="w-4 h-4 text-[#111111]" strokeWidth={2} />
          </button>

          {/* Booking panel */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-white">
            {/* Value prop */}
            <div className="px-8 pt-8 pb-6 md:px-10 md:pt-10 md:pb-8">
              <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#111111] leading-tight">
                Let&rsquo;s get you set up.
              </h2>
              <p className="mt-3 text-[15px] text-[#6B7280] leading-relaxed">
                Book a short onboarding call and we&rsquo;ll configure your AI
                sales agent and production dashboard. Most manufacturers are
                live within 15 minutes.
              </p>
            </div>

            {/* Cal.com embed */}
            <div className="flex-1 min-h-[400px] px-8 pb-8 md:px-10 md:pb-10">
              <iframe
                src="https://cal.com/james-scalecpg?embed=true&theme=light"
                title="Book a Call"
                className="w-full h-full min-h-[400px] border-0 rounded-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
