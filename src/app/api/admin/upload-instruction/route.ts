import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  // Auth check
  try {
    await requireSuperAdmin();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const manufacturerId = formData.get("manufacturerId") as string | null;
  const instructionId = formData.get("instructionId") as string | null;

  if (!file || !manufacturerId || !instructionId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
  }

  const db = createAdminClient();
  const filePath = `${manufacturerId}/${instructionId}/${file.name}`;

  const { error } = await db.storage
    .from("instruction-files")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ filePath });
}
