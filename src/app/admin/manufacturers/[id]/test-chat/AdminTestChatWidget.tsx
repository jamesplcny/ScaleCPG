"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, ChevronDown } from "lucide-react";

// ── Types ────────────────────────────────────────────

interface Message {
  role: "visitor" | "agent";
  content: string;
}

interface ManufacturerConfig {
  company_name: string;
  company_location: string | null;
  service_types: string[];
  certifications: string[];
}

interface TestLead {
  id: string;
  timestamp: Date;
  contactName: string;
  contactEmail: string;
  extractedFields: Record<string, string>;
  leadScore: number;
  aiSummary: string;
  transcript: Message[];
}

// ── Lead Score ───────────────────────────────────────

function recalcLeadScore(
  email: string,
  name: string,
  fields: Record<string, string>
): number {
  let score = 0;
  if (email && name) score += 20;
  else if (email || name) score += 10;
  if (fields.product_type) score += 15;
  if (fields.service_type) score += 15;
  if (fields.volume) score += 15;
  if (fields.timeline) score += 8;
  if (fields.packaging) score += 7;
  if (fields.budget) score += 5;
  if (fields.formulation_status) score += 5;
  if (fields.certifications_needed) score += 4;
  if (fields.target_market) score += 3;
  if (fields.company_name) score += 3;
  return Math.min(score, 100);
}

function scoreColor(score: number) {
  if (score >= 65) return "bg-[#10B981]";
  if (score >= 20) return "bg-[#F59E0B]";
  return "bg-[#EF4444]";
}

function scoreTextColor(score: number) {
  if (score >= 65) return "text-[#10B981]";
  if (score >= 20) return "text-[#F59E0B]";
  return "text-[#EF4444]";
}

const FIELD_LABELS: Record<string, string> = {
  product_type: "Product",
  service_type: "Service",
  volume: "Volume",
  timeline: "Timeline",
  packaging: "Packaging",
  budget: "Budget",
  formulation_status: "Formulation",
  certifications_needed: "Certifications",
  target_market: "Target Market",
  company_name: "Company",
  contact_phone: "Phone",
  notes: "Notes",
};

// ── Component ────────────────────────────────────────

export function AdminTestChatWidget({
  manufacturerId,
  companyName,
}: {
  manufacturerId: string;
  companyName: string;
}) {
  const router = useRouter();

  // Session + messages
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", content: "How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lead state
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [leadScore, setLeadScore] = useState(0);

  // Config
  const [config, setConfig] = useState<ManufacturerConfig | null>(null);

  // Threshold tracking
  const [thresholdReached, setThresholdReached] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Test leads (client-side only)
  const [testLeads, setTestLeads] = useState<TestLead[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load config
  useEffect(() => {
    fetch(`/api/chat/${manufacturerId}/config`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setConfig(data);
      })
      .catch(() => {});
  }, [manufacturerId]);

  // Recalculate lead score
  useEffect(() => {
    setLeadScore(recalcLeadScore(contactEmail, contactName, extractedFields));
  }, [contactEmail, contactName, extractedFields]);

  // ── Send message ──

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || isSubmitted) return;

    const visitorMsg: Message = { role: "visitor", content: trimmed };
    const updatedMessages = [...messages, visitorMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    const agentPlaceholder: Message = { role: "agent", content: "" };
    setMessages([...updatedMessages, agentPlaceholder]);

    try {
      const res = await fetch(`/api/chat/${manufacturerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages: updatedMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let agentContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "delta") {
              agentContent += event.content;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "agent", content: agentContent };
                return next;
              });
            } else if (event.type === "done") {
              if (event.sessionId) setSessionId(event.sessionId);
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "agent", content: event.displayContent };
                return next;
              });

              // Merge extracted fields and check threshold
              let newFields = extractedFields;
              if (event.extractedFields && Object.keys(event.extractedFields).length > 0) {
                newFields = { ...extractedFields, ...event.extractedFields };
                setExtractedFields(newFields);
              }

              // If score just crossed 65%, append the threshold message
              const newScore = recalcLeadScore(contactEmail, contactName, newFields);
              if (newScore >= 65 && !thresholdReached) {
                setThresholdReached(true);
                setTimeout(() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "agent",
                      content:
                        "We have enough information to work on your request! If you have any more questions, concerns, or details, please feel free to continue the conversation. Otherwise, click the submit button and we will get back to you ASAP.",
                    },
                  ]);
                }, 600);
              }
            } else if (event.type === "error") {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "agent", content: event.content };
                return next;
              });
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "agent", content: "Something went wrong. Please try again." };
        return next;
      });
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }

  // ── Test Submit (client-side only) ──

  async function handleTestSubmit() {
    if (leadScore < 65 || isSubmitting || isSubmitted) return;
    setIsSubmitting(true);

    let aiSummary = "Generating summary...";

    try {
      const res = await fetch(`/api/chat/${manufacturerId}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      aiSummary = data.summary || "Unable to generate summary.";
    } catch {
      aiSummary = "Summary generation failed.";
    }

    setTestLeads((prev) => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        contactName,
        contactEmail,
        extractedFields: { ...extractedFields },
        leadScore,
        aiSummary,
        transcript: [...messages],
      },
      ...prev,
    ]);

    setIsSubmitting(false);
    setShowSubmitModal(true);
  }

  function handleDismissSubmitModal() {
    setShowSubmitModal(false);
    // Reset for next test
    setMessages([{ role: "agent", content: "How can I help you today?" }]);
    setContactName("");
    setContactEmail("");
    setExtractedFields({});
    setLeadScore(0);
    setSessionId(null);
    setInput("");
    setIsSubmitted(false);
    setThresholdReached(false);
  }

  // ── Key handler ──

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function isFirstInGroup(idx: number) {
    if (idx === 0) return true;
    return messages[idx].role !== messages[idx - 1].role;
  }

  // ── Render ──

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col font-[family-name:var(--font-inter)]">
      {/* ─── TOP BAR ─── */}
      <div className="h-12 shrink-0 bg-[#111827] flex items-center justify-between px-5">
        <button
          onClick={() => router.push(`/admin/manufacturers/${manufacturerId}`)}
          className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Configuration
        </button>
        <span className="px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] text-[11px] font-semibold uppercase tracking-wider rounded-full">
          Test Mode
        </span>
      </div>

      {/* ─── THREE PANELS ─── */}
      <div className="flex flex-1 min-h-0">
        {/* ─── LEFT PANEL ─── */}
        <div className="w-[300px] shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Welcome */}
            <div>
              <h2 className="text-sm font-semibold text-[#111827] mb-2">
                Welcome!{" "}
                {config
                  ? `We are ${config.company_name}${config.company_location ? ` located in ${config.company_location}` : ""}.`
                  : ""}
              </h2>
              {config && config.service_types.length > 0 && (
                <>
                  <p className="text-xs text-[#6B7280] mb-2">
                    We provide the following services:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {config.service_types.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-medium rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Contact Fields */}
            <div className="space-y-2.5">
              <div>
                <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF] mb-1.5">
                  WORK EMAIL
                </p>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-[12px] text-[#111827] placeholder:text-[#D1D5DB] outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>
              <div>
                <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF] mb-1.5">
                  CONTACT NAME
                </p>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-[12px] text-[#111827] placeholder:text-[#D1D5DB] outline-none focus:border-[#4F46E5] transition-colors"
                />
              </div>
            </div>

            {/* Progress */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-semibold mb-2">
                Lead Progress
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${scoreColor(leadScore)}`}
                    style={{ width: `${leadScore}%` }}
                  />
                </div>
                <span className={`text-[13px] font-semibold tabular-nums ${scoreTextColor(leadScore)}`}>
                  {leadScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="p-5 pt-0">
            {leadScore >= 65 ? (
              <button
                onClick={handleTestSubmit}
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Generating summary..." : "Submit Test Lead →"}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-lg bg-[#F3F4F6] text-[#9CA3AF] text-sm font-medium cursor-not-allowed"
              >
                Keep chatting to complete your inquiry
              </button>
            )}
          </div>
        </div>

        {/* ─── CENTER PANEL (Chat) ─── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] relative">
          {/* Chat Header */}
          <div className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-[#E5E7EB] bg-white">
            <span className="text-sm font-semibold text-[#111827]">
              {config?.company_name ?? companyName}
            </span>
            <span className="text-[10px] text-[#9CA3AF]">Powered by ScaleCPG</span>
          </div>

          {/* Submit Confirmation Modal */}
          {showSubmitModal && (
            <div className="absolute inset-0 top-12 bg-black/30 flex items-center justify-center z-10">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg border border-[#E5E7EB] mx-4 text-center">
                <p className="text-lg font-semibold text-[#111827] mb-2">
                  Congratulations on your request, we will get back to you shortly!
                </p>
                <button
                  onClick={handleDismissSubmitModal}
                  className="mt-4 px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg cursor-pointer transition-colors border-none"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => {
              const first = isFirstInGroup(idx);
              if (msg.role === "agent") {
                return (
                  <div key={idx}>
                    {first && (
                      <p className="text-[10px] text-[#9CA3AF] font-medium mb-1">
                        {config?.company_name ?? companyName}
                      </p>
                    )}
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-[14px] text-[#374151] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <div key={idx} className="flex flex-col items-end">
                  {first && (
                    <p className="text-[10px] text-[#9CA3AF] font-medium mb-1 text-right">You</p>
                  )}
                  <div className="bg-[#4F46E5] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-[14px] text-white leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] inline-flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#E5E7EB] bg-white px-4 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Type a message..."
              className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#4F46E5] transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="w-9 h-9 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ─── RIGHT PANEL (Test Leads) ─── */}
        <div className="w-[320px] shrink-0 bg-white border-l border-[#E5E7EB] flex flex-col">
          <div className="p-5 pb-3 border-b border-[#E5E7EB]">
            <p className="text-[13px] font-semibold text-[#111827] uppercase tracking-wider">
              Test Lead Submissions
            </p>
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Submissions appear here for testing. They are not sent to the manufacturer dashboard.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {testLeads.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[12px] text-[#9CA3AF]">
                  No test leads yet. Complete a conversation and submit to see results here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {testLeads.map((lead, idx) => (
                  <TestLeadCard
                    key={lead.id}
                    lead={lead}
                    number={testLeads.length - idx}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Test Lead Card ───────────────────────────────────

function TestLeadCard({ lead, number }: { lead: TestLead; number: number }) {
  const [expanded, setExpanded] = useState(false);

  const fields = Object.entries(lead.extractedFields).filter(
    ([key]) => key !== "contact_name" && key !== "contact_email"
  );

  return (
    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#111827]">Test Lead #{number}</span>
        <span className="text-[11px] text-[#9CA3AF]">
          {lead.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Contact */}
      {(lead.contactName || lead.contactEmail) && (
        <>
          <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-semibold mt-3 mb-1.5">
            Contact
          </p>
          {lead.contactName && (
            <p className="text-[12px] text-[#374151]">
              <span className="text-[#9CA3AF]">Name:</span> {lead.contactName}
            </p>
          )}
          {lead.contactEmail && (
            <p className="text-[12px] text-[#374151]">
              <span className="text-[#9CA3AF]">Email:</span> {lead.contactEmail}
            </p>
          )}
        </>
      )}

      {/* Lead Data */}
      {fields.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-semibold mt-3 mb-1.5">
            Lead Data
          </p>
          {fields.map(([key, value]) => (
            <p key={key} className="text-[12px] text-[#374151]">
              <span className="text-[#9CA3AF]">{FIELD_LABELS[key] ?? key}:</span> {value}
            </p>
          ))}
        </>
      )}

      {/* Score */}
      <p className="text-[12px] text-[#374151] mt-1">
        <span className="text-[#9CA3AF]">Score:</span>{" "}
        <span className={`font-semibold ${scoreTextColor(lead.leadScore)}`}>
          {lead.leadScore}%
        </span>
      </p>

      {/* AI Summary */}
      <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-semibold mt-3 mb-1.5">
        AI Summary
      </p>
      <div className="text-[12px] text-[#374151] italic bg-white rounded-lg p-3 border border-[#E5E7EB]">
        {lead.aiSummary}
      </div>

      {/* Transcript Toggle */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="text-[11px] text-[#4F46E5] font-medium cursor-pointer flex items-center gap-1 mt-3 bg-transparent border-none p-0"
      >
        View Full Transcript
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-2 border-t border-[#E5E7EB] pt-2 space-y-0">
          {lead.transcript.map((msg, i) => (
            <div key={i} className="text-[11px] py-1.5">
              <span
                className={`font-semibold ${msg.role === "agent" ? "text-[#4F46E5]" : "text-[#111827]"}`}
              >
                {msg.role === "agent" ? "Agent:" : "Visitor:"}
              </span>{" "}
              <span className="text-[#6B7280]">{msg.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
