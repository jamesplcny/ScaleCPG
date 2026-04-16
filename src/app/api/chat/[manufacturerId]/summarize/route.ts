import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  let body: { messages: Array<{ role: "visitor" | "agent"; content: string }> };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const transcript = body.messages
    .map((m) => `${m.role === "visitor" ? "Visitor" : "Agent"}: ${m.content}`)
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a lead summarization assistant. Given the following conversation between a potential client and an AI sales agent for a contract manufacturer, produce a 2-3 sentence summary of what the prospect needs. Highlight key data points: product type, service type, volume, timeline, budget, formulation status, and any other relevant details mentioned. Keep it concise and actionable — this summary will be read by a sales team.\n\nTranscript:\n${transcript}`,
        },
      ],
    });

    const block = response.content[0];
    const summary = block.type === "text" ? block.text : "Unable to generate summary.";

    return Response.json({ summary });
  } catch {
    return Response.json({ summary: "Summary generation failed — review transcript manually." });
  }
}
