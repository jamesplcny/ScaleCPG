import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ manufacturerId: string }> }
) {
  const { manufacturerId } = await params;
  const db = createAdminClient();

  const { data: mfg } = await db
    .from("admin_manufacturers")
    .select("company_name, config")
    .eq("id", manufacturerId)
    .maybeSingle();

  if (!mfg) {
    return Response.json({ error: "Manufacturer not found" }, { status: 404 });
  }

  const config = (mfg.config ?? {}) as Record<string, unknown>;

  // Extract service type names for display (handles both legacy and new formats)
  let serviceTypeNames: string[] = [];
  if (Array.isArray(config.service_types)) {
    if (config.service_types.length > 0 && typeof config.service_types[0] === "string") {
      serviceTypeNames = config.service_types as string[];
    } else {
      serviceTypeNames = (config.service_types as Array<{ name: string }>).map((s) => s.name);
    }
  }

  return Response.json({
    company_name: mfg.company_name,
    company_location: config.company_location ?? null,
    service_types: serviceTypeNames,
    certifications: config.certifications ?? [],
    qualifications: Array.isArray(config.qualifications) ? config.qualifications : [],
  });
}
