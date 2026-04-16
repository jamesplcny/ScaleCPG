"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Sparkles } from "lucide-react";

// ── Types ────────────────────────────────────────────

interface Message {
  role: "visitor" | "agent";
  content: string;
}

interface Qualification {
  id: string;
  label: string;
  key: string;
}

interface ManufacturerConfig {
  company_name: string;
  company_location: string | null;
  service_types: string[];
  certifications: string[];
  qualifications: Qualification[];
}

// ── Progress helpers ─────────────────────────────────

function progressColor(pct: number) {
  if (pct === 100) return "bg-[#10B981]";
  if (pct >= 50) return "bg-[#F59E0B]";
  return "bg-[#EF4444]";
}

function progressTextColor(pct: number) {
  if (pct === 100) return "text-[#10B981]";
  if (pct >= 50) return "text-[#F59E0B]";
  return "text-[#EF4444]";
}

// ── Component ────────────────────────────────────────

export function ChatWidget({ manufacturerId }: { manufacturerId: string }) {
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

  // Config
  const [config, setConfig] = useState<ManufacturerConfig | null>(null);

  // Derived: progress + completeness from qualifications + contact fields
  const qualifications = config?.qualifications ?? [];
  const filledQuals = qualifications.filter((q) => !!extractedFields[q.key]).length;
  const filledContact =
    (contactEmail.trim() ? 1 : 0) + (contactName.trim() ? 1 : 0);
  const totalSlots = qualifications.length + 2;
  const filledSlots = filledQuals + filledContact;
  const progressPct =
    totalSlots === 0 ? 0 : Math.round((filledSlots / totalSlots) * 100);
  const isComplete = filledSlots === totalSlots && totalSlots >= 2;

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load config on mount
  useEffect(() => {
    fetch(`/api/chat/${manufacturerId}/config`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setConfig(data);
      })
      .catch(() => {});
  }, [manufacturerId]);

  // ── Send message ──

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || isSubmitted) return;

    const visitorMsg: Message = { role: "visitor", content: trimmed };
    const updatedMessages = [...messages, visitorMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Add placeholder for streaming agent response
    const agentPlaceholder: Message = { role: "agent", content: "" };
    setMessages([...updatedMessages, agentPlaceholder]);

    try {
      const res = await fetch(`/api/chat/${manufacturerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages: updatedMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Request failed");
      }

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

              // Use displayContent (XML-stripped)
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: "agent",
                  content: event.displayContent,
                };
                return next;
              });

              // Merge extracted fields
              if (event.extractedFields && Object.keys(event.extractedFields).length > 0) {
                setExtractedFields((prev) => ({ ...prev, ...event.extractedFields }));
              }
            } else if (event.type === "error") {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "agent", content: event.content };
                return next;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "agent",
          content: "Something went wrong. Please try again.",
        };
        return next;
      });
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }

  // ── Submit lead ──

  async function handleSubmit() {
    if (!isComplete || isSubmitted || isSubmitting || !sessionId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          manufacturerId,
          contactEmail,
          contactName,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content:
              "Thank you! Your inquiry has been submitted. The team will be in touch shortly.",
          },
        ]);
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Key handler ──

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Determine first-message-in-group for labels ──

  function isFirstInGroup(idx: number) {
    if (idx === 0) return true;
    return messages[idx].role !== messages[idx - 1].role;
  }

  // ── Render ──

  return (
    <div className="flex h-screen font-[family-name:var(--font-inter)]">
      {/* ─── LEFT PANEL ─── */}
      <div className="w-[340px] shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col max-md:hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
              <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">
                FROM AI SCOUT
              </span>
            </div>
            <h2 className="mt-1 text-[14px] font-semibold text-[#111111]">
              {config?.company_name ?? "Loading…"}
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              {contactName.trim() ? contactName : "—"} · {progressPct}% qualified
            </p>
          </div>

          {/* Contact Fields */}
          <div className="px-5 py-4 border-b border-[#E5E7EB] space-y-3">
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

          {/* Qualifications */}
          {qualifications.length > 0 && (
            <div className="px-5 py-4 space-y-3">
              {qualifications.map((q) => {
                const value = extractedFields[q.key];
                return (
                  <div key={q.id}>
                    <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF]">
                      {q.label.toUpperCase()}
                    </p>
                    {value ? (
                      <p
                        key={value}
                        className="text-[11px] font-medium text-[#111827] mt-0.5 animate-fade-in-up"
                      >
                        {value}
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-[#D1D5DB] mt-0.5">
                        —
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress Bar + Submit pinned bottom */}
        <div className="border-t border-[#E5E7EB] p-5 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
                Qualification Progress
              </p>
              <span
                className={`text-[11px] font-semibold tabular-nums ${progressTextColor(progressPct)}`}
              >
                {filledSlots}/{totalSlots}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor(progressPct)}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {isSubmitted ? (
            <button
              disabled
              className="w-full py-3 rounded-lg bg-[#10B981] text-white text-sm font-medium cursor-default"
            >
              Inquiry Submitted ✓
            </button>
          ) : isComplete ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed animate-[pulse_2s_ease-in-out_1]"
            >
              {isSubmitting ? "Submitting..." : "Submit Inquiry →"}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-lg bg-[#F3F4F6] text-[#9CA3AF] text-sm font-medium cursor-not-allowed"
            >
              Complete all fields to submit
            </button>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        {/* Chat Header */}
        <div className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-[#E5E7EB] bg-white">
          <span className="text-sm font-semibold text-[#111827]">
            {config?.company_name ?? "Chat"}
          </span>
          <span className="text-[10px] text-[#9CA3AF]">
            Powered by ScaleCPG
          </span>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const first = isFirstInGroup(idx);
            if (msg.role === "agent") {
              return (
                <div key={idx}>
                  {first && (
                    <p className="text-[10px] text-[#9CA3AF] font-medium mb-1">
                      {config?.company_name ?? "ScaleCPG"}
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
                  <p className="text-[10px] text-[#9CA3AF] font-medium mb-1 text-right">
                    You
                  </p>
                )}
                <div className="bg-[#4F46E5] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                  <p className="text-[14px] text-white leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
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

        {/* Mobile-only: left panel content as a collapsible bar */}
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor(progressPct)}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`text-[13px] font-semibold tabular-nums ${progressTextColor(progressPct)}`}>
              {progressPct}%
            </span>
          </div>
          {!isSubmitted && isComplete && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium cursor-pointer transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Inquiry →"}
            </button>
          )}
          {isSubmitted && (
            <button
              disabled
              className="w-full py-2.5 rounded-lg bg-[#10B981] text-white text-sm font-medium cursor-default"
            >
              Inquiry Submitted ✓
            </button>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-3 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming || isSubmitted}
            placeholder="Type a message..."
            className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#4F46E5] transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || isSubmitted || !input.trim()}
            className="w-9 h-9 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
