import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  let body: { sessionId: string; manufacturerId: string; contactEmail?: string; contactName?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, manufacturerId } = body;

  if (!sessionId || !manufacturerId) {
    return Response.json({ error: "sessionId and manufacturerId are required" }, { status: 400 });
  }

  const db = createAdminClient();

  // Fetch session and validate it belongs to the manufacturer
  const { data: session } = await db
    .from("chat_sessions")
    .select("id, manufacturer_id, lead_data, lead_score, status")
    .eq("id", sessionId)
    .eq("manufacturer_id", manufacturerId)
    .maybeSingle();

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status === "submitted") {
    return Response.json({ error: "Lead already submitted" }, { status: 400 });
  }

  // Fetch all messages for the transcript
  const { data: messages } = await db
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  // Build transcript for summary generation
  const transcript = (messages ?? [])
    .map((m) => `${m.role === "visitor" ? "Visitor" : "Agent"}: ${m.content}`)
    .join("\n\n");

  // Generate AI summary
  let summary = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Summarize this sales conversation in 3-4 sentences. Focus on what the prospect needs, their key requirements, and their readiness to proceed. Write it as a brief for a sales rep who will follow up.\n\nTranscript:\n${transcript}`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type === "text") {
      summary = block.text;
    }
  } catch {
    summary = "Summary generation failed — review transcript manually.";
  }

  const leadData = { ...(session.lead_data ?? {}) } as Record<string, unknown>;
  // Merge contact fields from the widget form
  if (body.contactEmail) leadData.contact_email = body.contactEmail;
  if (body.contactName) leadData.contact_name = body.contactName;
  const leadScore = session.lead_score ?? 0;

  // Insert lead
  const { data: lead, error: leadErr } = await db
    .from("chat_leads")
    .insert({
      session_id: sessionId,
      manufacturer_id: manufacturerId,
      lead_data: leadData,
      lead_score: leadScore,
      summary,
    })
    .select("id")
    .single();

  if (leadErr || !lead) {
    return Response.json({ error: "Failed to create lead" }, { status: 500 });
  }

  // Update session status
  await db
    .from("chat_sessions")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  return Response.json({ success: true, leadId: lead.id });
}
