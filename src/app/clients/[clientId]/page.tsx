import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types/database";

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle() as { data: Client | null; error: { message: string } | null };

  if (error) console.error("[client-detail] fetch error:", error.message);
  if (!data) notFound();
  const client = data;

  const initials = client.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="mb-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors no-underline mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <h2 className="font-semibold text-4xl">{client.name}</h2>
      </div>

      <div className="flex items-center gap-5 mb-8 p-6 bg-bg-card border border-border rounded-xl">
        <div className="w-14 h-14 rounded-full border-2 border-border bg-bg-secondary flex items-center justify-center shrink-0 text-lg font-semibold text-text-secondary">
          {initials}
        </div>
        <div>
          <h3 className="font-semibold text-xl">{client.name}</h3>
          <p className="text-sm text-text-muted mt-1">
            Created {new Date(client.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
    </>
  );
}
