import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";

const anthropic = new Anthropic();

// ── Helpers ──────────────────────────────────────────

function parseLeadData(rawContent: string): {
  displayContent: string;
  extractedFields: Record<string, string>;
} {
  const leadDataMatch = rawContent.match(/<lead_data>([\s\S]*?)<\/lead_data>/);
  const extractedFields: Record<string, string> = {};

  if (leadDataMatch) {
    const fieldRegex = /<field name="(\w+)">(.*?)<\/field>/g;
    let match;
    while ((match = fieldRegex.exec(leadDataMatch[1])) !== null) {
      const [, fieldName, value] = match;
      if (value.trim()) {
        extractedFields[fieldName] = value.trim();
      }
    }
  }

  const displayContent = rawContent
    .replace(/<lead_data>[\s\S]*?<\/lead_data>/g, "")
    .trim();

  return { displayContent, extractedFields };
}

interface Qualification {
  id: string;
  label: string;
  key: string;
}

function calculateLeadScore(
  leadData: Record<string, unknown>,
  qualifications: Qualification[]
): number {
  if (!qualifications.length) {
    return leadData.contact_email && leadData.contact_name ? 100 : 50;
  }
  const filled = qualifications.filter((q) => !!leadData[q.key]).length;
  const contactPoints =
    (leadData.contact_email ? 1 : 0) + (leadData.contact_name ? 1 : 0);
  const total = qualifications.length + 2;
  return Math.round(((filled + contactPoints) / total) * 100);
}

interface StructuredServiceType {
  name: string;
  categories?: string[];
  moq?: string;
  lead_time?: string;
  custom_instructions?: Array<{
    title: string;
    type: "text" | "file";
    content?: string;
    fileName?: string;
  }>;
}

function buildSystemPrompt(mfg: {
  company_name: string;
  config: Record<string, unknown>;
}): string {
  const c = mfg.config;
  const lines: string[] = [];

  let header = `You are an AI sales assistant for ${mfg.company_name}, a contract manufacturer`;
  if (c.company_location) header += ` located in ${c.company_location}`;
  header += ".";
  lines.push(header);

  if (Array.isArray(c.certifications) && c.certifications.length > 0) {
    lines.push("", `Certifications: ${c.certifications.join(", ")}.`);
  }

  // Structured service types
  if (Array.isArray(c.service_types) && c.service_types.length > 0) {
    // Handle both legacy (string[]) and new (object[]) formats
    const isLegacy = typeof c.service_types[0] === "string";

    if (isLegacy) {
      lines.push("", `Services offered: ${(c.service_types as string[]).join(", ")}.`);
    } else {
      const services = c.service_types as StructuredServiceType[];
      lines.push("", "## Services Offered");

      for (const svc of services) {
        let svcLine = `\n### ${svc.name}`;
        lines.push(svcLine);

        if (svc.categories && svc.categories.length > 0) {
          lines.push(`Categories: ${svc.categories.join(", ")}`);
        }
        if (svc.moq) {
          lines.push(`Minimum order quantity: ${svc.moq}`);
        }
        if (svc.lead_time) {
          lines.push(`Typical lead time: ${svc.lead_time}`);
        }

        // Custom instructions for this service
        if (svc.custom_instructions && svc.custom_instructions.length > 0) {
          for (const ci of svc.custom_instructions) {
            if (ci.type === "text" && ci.content) {
              lines.push(`\nInstruction — ${ci.title}:`, ci.content);
            } else if (ci.type === "file" && ci.fileName) {
              lines.push(`\nReference document — ${ci.title}: (file: ${ci.fileName})`);
            }
          }
        }
      }
    }
  }

  // Top-level custom instructions
  if (Array.isArray(c.custom_instructions) && c.custom_instructions.length > 0) {
    lines.push("", "## General Instructions");
    for (const ci of c.custom_instructions as Array<{ title: string; type: string; content?: string; fileName?: string }>) {
      if (ci.type === "text" && ci.content) {
        lines.push(`\n${ci.title}:`, ci.content);
      } else if (ci.type === "file" && ci.fileName) {
        lines.push(`\nReference document — ${ci.title}: (file: ${ci.fileName})`);
      }
    }
  }

  const qualifications: Qualification[] = Array.isArray(c.qualifications)
    ? (c.qualifications as Qualification[])
    : [];

  if (qualifications.length > 0) {
    lines.push("", "## Qualification Questions");
    lines.push(
      "",
      "The manufacturer has set the following qualification questions. Naturally weave these into the conversation and extract them as lead_data fields with the exact keys shown:"
    );
    lines.push("");
    for (const q of qualifications) {
      lines.push(`- ${q.label} → field key: ${q.key}`);
    }
  }

  lines.push("", buildSuffix(qualifications));

  return lines.join("\n");
}

function buildSuffix(qualifications: Qualification[]): string {
  const fieldLines = [
    "- contact_name",
    "- contact_email",
    "- contact_phone",
    "- company_name",
    ...qualifications.map((q) => `- ${q.key}`),
    "- notes",
  ].join("\n");

  return `## Your Role

You are the first point of contact for potential clients visiting the company website. Your goal is to have a natural, helpful conversation that understands what the visitor needs, determines if their needs match the company's capabilities, and collects enough information to generate a qualified lead.

## Conversation Rules

- Start your very first message with exactly: "How can I help you today?"
- Ask ONE question at a time — never stack multiple questions
- Keep responses to 2-3 sentences max
- Be warm and conversational, not robotic
- Mirror the visitor's language and formality level
- If they ask about pricing, explain that pricing depends on their specific requirements and offer to have the team prepare a custom quote
- Never pressure for information — let the conversation flow naturally
- If their needs clearly don't match the company's capabilities, be honest about it

## Lead Data Extraction

After EVERY response, include a <lead_data> XML block with ANY new information extracted from the visitor's most recent message. Only include fields where you learned something NEW.

Available fields (use these exact keys in the <field name="..."> tags):
${fieldLines}

Response format: end every reply with a <lead_data> block. Each <field name="key">value</field> must use one of the exact keys listed above. Example shape:

<lead_data>
<field name="contact_name">Sarah Chen</field>
<field name="contact_email">sarah@example.com</field>
</lead_data>

If no new information was shared, include an empty block:

<lead_data>
</lead_data>

## Critical Rules
- NEVER mention lead_data tags, progress tracking, lead scoring, or any internal systems
- NEVER fabricate capabilities not listed above
- NEVER provide specific pricing unless it's in the special instructions
- The visitor must never know their data is being extracted — the conversation should feel completely natural`;
}

// ── Route Handler ────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ manufacturerId: string }> }
) {
  const { manufacturerId } = await params;

  let body: {
    sessionId: string | null;
    messages: Array<{ role: "visitor" | "agent"; content: string }>;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = createAdminClient();

  // Load manufacturer
  const { data: mfg } = await db
    .from("admin_manufacturers")
    .select("id, company_name, config")
    .eq("id", manufacturerId)
    .maybeSingle();

  if (!mfg) {
    return Response.json({ error: "Manufacturer not found" }, { status: 404 });
  }

  // Session — reuse or create
  let sessionId = body.sessionId;

  if (!sessionId) {
    const { data: session, error: sessionErr } = await db
      .from("chat_sessions")
      .insert({ manufacturer_id: manufacturerId })
      .select("id")
      .single();

    if (sessionErr || !session) {
      return Response.json({ error: "Failed to create session" }, { status: 500 });
    }
    sessionId = session.id;
  }

  // Build system prompt
  const systemPrompt = buildSystemPrompt({
    company_name: mfg.company_name,
    config: (mfg.config ?? {}) as Record<string, unknown>,
  });

  // Convert messages to Claude format
  const claudeMessages: Array<{ role: "user" | "assistant"; content: string }> =
    body.messages.map((m) => ({
      role: m.role === "visitor" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

  // Store the latest visitor message
  const lastVisitorMsg = body.messages.filter((m) => m.role === "visitor").pop();
  if (lastVisitorMsg) {
    await db.from("chat_messages").insert({
      session_id: sessionId,
      role: "visitor",
      content: lastVisitorMsg.content,
    });
  }

  // Stream from Claude via SSE
  const encoder = new TextEncoder();
  const currentSessionId = sessionId;

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";

      try {
        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: claudeMessages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;

            // Stream delta — strip any partial lead_data from display
            const chunk = JSON.stringify({ type: "delta", content: text }) + "\n";
            controller.enqueue(encoder.encode(`data: ${chunk}\n`));
          }
        }

        // Parse the complete response
        const { displayContent, extractedFields } = parseLeadData(fullResponse);

        // Store agent message
        await db.from("chat_messages").insert({
          session_id: currentSessionId,
          role: "agent",
          content: displayContent,
          raw_content: fullResponse,
          extracted_fields: extractedFields,
        });

        // Merge extracted fields into session lead_data
        const { data: session } = await db
          .from("chat_sessions")
          .select("lead_data")
          .eq("id", currentSessionId)
          .single();

        const existingLeadData = (session?.lead_data ?? {}) as Record<string, unknown>;
        const mergedLeadData: Record<string, unknown> = { ...existingLeadData };

        for (const [key, value] of Object.entries(extractedFields)) {
          if (value) {
            mergedLeadData[key] = value;
          }
        }

        const mfgQualifications: Qualification[] = Array.isArray(
          (mfg.config as Record<string, unknown>)?.qualifications
        )
          ? (((mfg.config as Record<string, unknown>).qualifications) as Qualification[])
          : [];
        const leadScore = calculateLeadScore(mergedLeadData, mfgQualifications);

        await db
          .from("chat_sessions")
          .update({
            lead_data: mergedLeadData,
            lead_score: leadScore,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSessionId);

        // Send final done event
        const doneChunk =
          JSON.stringify({
            type: "done",
            sessionId: currentSessionId,
            displayContent,
            extractedFields,
            leadScore,
          }) + "\n";
        controller.enqueue(encoder.encode(`data: ${doneChunk}\n`));
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An error occurred";
        const errorChunk =
          JSON.stringify({
            type: "error",
            content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
            error: errorMsg,
          }) + "\n";
        controller.enqueue(encoder.encode(`data: ${errorChunk}\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
