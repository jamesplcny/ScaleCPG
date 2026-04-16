"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendInvitationAction } from "../actions";

interface Invitation {
  id: string;
  email: string;
  status: string;
  accepted_at: string | null;
  created_at: string;
}

interface Member {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

type Tab = "members" | "invites";

export function InviteForm({
  adminManufacturerId,
  invitations,
  members,
}: {
  adminManufacturerId: string;
  invitations: Invitation[];
  members: Member[];
}) {
  const [tab, setTab] = useState<Tab>("members");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const sentInvites = invitations.filter((i) => i.status !== "accepted");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await sendInvitationAction({
      adminManufacturerId,
      email,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(`Invitation sent to ${email}`);
    setEmail("");
    setLoading(false);
    router.refresh();
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-[#D1FAE5] text-[#10B981]";
      case "expired":
        return "bg-[#F3F4F6] text-[#6B7280]";
      default:
        return "bg-[#FEF3C7] text-[#F59E0B]";
    }
  };

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
      active
        ? "border-[#4F46E5] text-[#111111]"
        : "border-transparent text-[#6B7280] hover:text-[#111111]"
    }`;

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-[#E5E7EB] mb-5">
        <button
          type="button"
          onClick={() => setTab("members")}
          className={tabClass(tab === "members")}
        >
          Members ({members.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("invites")}
          className={tabClass(tab === "invites")}
        >
          Invites Sent ({sentInvites.length})
        </button>
      </div>

      {tab === "members" ? (
        members.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center">
            <p className="text-[#9CA3AF] text-sm">
              No team members have access yet.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left px-5 py-3 text-[11px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                    Role
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-[#E5E7EB] last:border-b-0"
                  >
                    <td className="px-5 py-3 text-[#111111]">{m.email}</td>
                    <td className="px-5 py-3 text-[#6B7280] capitalize">
                      {m.role}
                    </td>
                    <td className="px-5 py-3 text-[#9CA3AF]">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex gap-3 mb-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="team@example.com"
              className="flex-1 px-4 py-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#4F46E5]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-lg border-none cursor-pointer transition-colors hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </form>

          {error && (
            <div className="text-sm text-[#EF4444] bg-[#FEE2E2] border border-[#EF4444]/20 rounded-lg px-4 py-2.5 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-[#10B981] bg-[#D1FAE5] border border-[#10B981]/20 rounded-lg px-4 py-2.5 mb-4">
              {success}
            </div>
          )}

          {sentInvites.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center">
              <p className="text-[#9CA3AF] text-sm">No pending invitations.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left px-5 py-3 text-[11px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                      Email
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                      Sent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sentInvites.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-[#E5E7EB] last:border-b-0"
                    >
                      <td className="px-5 py-3 text-[#111111]">{inv.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColor(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#9CA3AF]">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
