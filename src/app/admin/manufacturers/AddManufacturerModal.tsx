"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { createManufacturerAction } from "./actions";

export function AddManufacturerModal() {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await createManufacturerAction({ companyName });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setCompanyName("");
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-lg border-none cursor-pointer transition-colors hover:bg-[#4338CA]"
      >
        Add Manufacturer
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Manufacturer">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-[#EF4444] bg-[#FEE2E2] border border-[#EF4444]/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#4F46E5]"
              placeholder="e.g. Acme Manufacturing"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#4F46E5] border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Manufacturer"}
          </button>
        </form>
      </Modal>
    </>
  );
}
