"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, FileText, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { updateManufacturerConfigAction } from "./actions";

// ── Types ────────────────────────────────────────────

interface CustomInstruction {
  id: string;
  title: string;
  type: "text" | "file";
  content?: string;
  fileName?: string;
  filePath?: string;
}

interface ServiceType {
  name: string;
  categories: string[];
  moq: string;
  lead_time: string;
  custom_instructions: CustomInstruction[];
}

interface Qualification {
  id: string;
  label: string;
  key: string;
}

function slugifyKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

interface ManufacturerConfigFormProps {
  manufacturerId: string;
  companyName: string;
  config: Record<string, unknown>;
}

// ── Helpers ──────────────────────────────────────────

function parseServiceTypes(config: Record<string, unknown>): ServiceType[] {
  const raw = config.service_types;
  if (!Array.isArray(raw)) return [];

  // Handle legacy flat string[] format
  if (raw.length > 0 && typeof raw[0] === "string") {
    return (raw as string[]).map((name) => ({
      name,
      categories: [],
      moq: "",
      lead_time: "",
      custom_instructions: [],
    }));
  }

  return (raw as ServiceType[]).map((st) => ({
    name: st.name ?? "",
    categories: Array.isArray(st.categories) ? st.categories : [],
    moq: st.moq ?? "",
    lead_time: st.lead_time ?? "",
    custom_instructions: Array.isArray(st.custom_instructions)
      ? st.custom_instructions
      : [],
  }));
}

// ── Main Form ────────────────────────────────────────

export function ManufacturerConfigForm({
  manufacturerId,
  companyName: initialCompanyName,
  config,
}: ManufacturerConfigFormProps) {
  const router = useRouter();

  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [companyLocation, setCompanyLocation] = useState(
    (config.company_location as string) ?? ""
  );
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(
    parseServiceTypes(config)
  );
  const [certifications, setCertifications] = useState<string[]>(
    (config.certifications as string[]) ?? []
  );
  const [customInstructions, setCustomInstructions] = useState<CustomInstruction[]>(
    (config.custom_instructions as CustomInstruction[]) ?? []
  );
  const [qualifications, setQualifications] = useState<Qualification[]>(
    (config.qualifications as Qualification[]) ?? []
  );

  // Snapshot of initial values for dirty checking
  const initialSnapshot = useMemo(() => JSON.stringify({
    companyName: initialCompanyName,
    companyLocation: (config.company_location as string) ?? "",
    serviceTypes: parseServiceTypes(config),
    certifications: (config.certifications as string[]) ?? [],
    customInstructions: (config.custom_instructions as CustomInstruction[]) ?? [],
    qualifications: (config.qualifications as Qualification[]) ?? [],
  }), [initialCompanyName, config]);

  const currentSnapshot = JSON.stringify({
    companyName,
    companyLocation,
    serviceTypes,
    certifications,
    customInstructions,
    qualifications,
  });

  const hasChanges = currentSnapshot !== initialSnapshot;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Service type CRUD
  const [addingService, setAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  function addServiceType() {
    const trimmed = newServiceName.trim();
    if (!trimmed || serviceTypes.some((s) => s.name === trimmed)) return;
    setServiceTypes((prev) => [
      ...prev,
      { name: trimmed, categories: [], moq: "", lead_time: "", custom_instructions: [] },
    ]);
    setNewServiceName("");
    setAddingService(false);
  }

  function removeServiceType(idx: number) {
    setServiceTypes((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateServiceType(idx: number, updates: Partial<ServiceType>) {
    setServiceTypes((prev) =>
      prev.map((st, i) => (i === idx ? { ...st, ...updates } : st))
    );
  }

  // Save
  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);

    const result = await updateManufacturerConfigAction({
      manufacturerId,
      companyName,
      config: {
        company_location: companyLocation,
        service_types: serviceTypes,
        certifications,
        custom_instructions: customInstructions,
        qualifications,
      },
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSuccess("Configuration saved.");
    setSaving(false);
    router.refresh();
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-transparent text-sm text-[#111111] outline-none transition-colors focus:border-[#4F46E5]";
  const labelClass = "block text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-2";

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5">
      {/* Company Name */}
      <div>
        <label className={labelClass}>Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          className={inputClass}
          placeholder="e.g. Acme Manufacturing"
        />
      </div>

      {/* Company Location */}
      <div>
        <label className={labelClass}>Company Location</label>
        <input
          type="text"
          value={companyLocation}
          onChange={(e) => setCompanyLocation(e.target.value)}
          className={inputClass}
          placeholder="e.g. Los Angeles, CA"
        />
      </div>

      {/* Certifications */}
      <div>
        <label className={labelClass}>Certifications</label>
        <TagInput
          tags={certifications}
          onChange={setCertifications}
          addLabel="+ Add Certification"
          placeholder="e.g. FDA Registered"
        />
      </div>

      {/* Qualification Questions */}
      <div>
        <label className={labelClass}>Qualification Questions</label>
        <p className="text-[11px] text-[#9CA3AF] mb-3 -mt-1">
          The AI sales agent will weave these into the conversation and the
          buyer&rsquo;s side panel will show progress as each one is answered.
        </p>
        <QualificationsEditor
          qualifications={qualifications}
          onChange={setQualifications}
        />
      </div>

      {/* Custom Instructions (top-level) */}
      <CustomInstructionsSection
        instructions={customInstructions}
        onChange={setCustomInstructions}
        manufacturerId={manufacturerId}
        label="Custom Instructions for AI Agent"
      />

      {/* Service Types */}
      <div>
        <label className={labelClass}>Service Types</label>

        {serviceTypes.length === 0 && !addingService && (
          <p className="text-xs text-[#9CA3AF] mb-3">No service types configured yet.</p>
        )}

        <div className="space-y-4">
          {serviceTypes.map((st, idx) => (
            <ServiceTypeCard
              key={`${st.name}-${idx}`}
              serviceType={st}
              manufacturerId={manufacturerId}
              onChange={(updates) => updateServiceType(idx, updates)}
              onRemove={() => removeServiceType(idx)}
            />
          ))}
        </div>

        <div className="mt-3">
          {addingService ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addServiceType(); }
                  if (e.key === "Escape") { setNewServiceName(""); setAddingService(false); }
                }}
                placeholder="e.g. Private Label"
                className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111111] outline-none focus:border-[#4F46E5] flex-1"
              />
              <button
                onClick={addServiceType}
                disabled={!newServiceName.trim()}
                className="px-3 py-2 bg-[#4F46E5] text-white text-sm rounded-lg border-none cursor-pointer hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => { setNewServiceName(""); setAddingService(false); }}
                className="px-3 py-2 text-[#6B7280] text-sm bg-transparent border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingService(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#4F46E5] font-medium cursor-pointer bg-transparent border-none p-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service Type
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="text-sm text-[#EF4444] bg-[#FEE2E2] border border-[#EF4444]/20 rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-[#10B981] bg-[#D1FAE5] border border-[#10B981]/20 rounded-lg px-4 py-2.5">
          {success}
        </div>
      )}

      {/* Save */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !companyName.trim() || !hasChanges}
          className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}

// ── Custom Instructions Section (reusable) ───────────

function CustomInstructionsSection({
  instructions,
  onChange,
  manufacturerId,
  label,
  modalTitle,
}: {
  instructions: CustomInstruction[];
  onChange: (instructions: CustomInstruction[]) => void;
  manufacturerId: string;
  label: string;
  modalTitle?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const labelClass = "block text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-2";

  function addInstruction(instruction: CustomInstruction) {
    onChange([...instructions, instruction]);
    setShowModal(false);
  }

  function removeInstruction(id: string) {
    onChange(instructions.filter((ci) => ci.id !== id));
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>

      {instructions.length > 0 && (
        <div className="space-y-2 mb-3">
          {instructions.map((ci) => (
            <div
              key={ci.id}
              className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0">
                {ci.type === "file" ? (
                  <Upload className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                )}
                <span className="text-xs text-[#111827] font-medium truncate">
                  {ci.title}
                </span>
                <span className="text-[10px] text-[#9CA3AF]">
                  {ci.type === "file" ? ci.fileName : "text"}
                </span>
              </div>
              <button
                onClick={() => removeInstruction(ci.id)}
                className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors bg-transparent border-none cursor-pointer p-0 shrink-0 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 text-xs text-[#4F46E5] font-medium cursor-pointer bg-transparent border-none p-0"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Instruction
      </button>

      {showModal && (
        <InstructionModal
          manufacturerId={manufacturerId}
          serviceTypeName={modalTitle ?? "General"}
          onSave={addInstruction}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ── Service Type Card ────────────────────────────────

function ServiceTypeCard({
  serviceType,
  manufacturerId,
  onChange,
  onRemove,
}: {
  serviceType: ServiceType;
  manufacturerId: string;
  onChange: (updates: Partial<ServiceType>) => void;
  onRemove: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const inputClass =
    "w-full px-3 py-2 border border-[#E5E7EB] rounded-lg bg-transparent text-sm text-[#111111] outline-none transition-colors focus:border-[#4F46E5]";
  const subLabelClass = "block text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1.5";

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F9FAFB]">
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
        >
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
          )}
          <span className="text-sm font-semibold text-[#111827]">{serviceType.name}</span>
        </button>
        <button
          onClick={onRemove}
          className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Categories */}
          <div>
            <label className={subLabelClass}>Categories</label>
            <TagInput
              tags={serviceType.categories}
              onChange={(categories) => onChange({ categories })}
              addLabel="+ Add Category"
              placeholder="e.g. Skincare"
            />
          </div>

          {/* MOQ + Lead Time side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={subLabelClass}>MOQ</label>
              <input
                type="text"
                value={serviceType.moq}
                onChange={(e) => onChange({ moq: e.target.value })}
                className={inputClass}
                placeholder="e.g. 500 units"
              />
            </div>
            <div>
              <label className={subLabelClass}>Lead Time</label>
              <input
                type="text"
                value={serviceType.lead_time}
                onChange={(e) => onChange({ lead_time: e.target.value })}
                className={inputClass}
                placeholder="e.g. 4-6 weeks"
              />
            </div>
          </div>

          {/* Custom Instructions */}
          <CustomInstructionsSection
            instructions={serviceType.custom_instructions}
            onChange={(custom_instructions) => onChange({ custom_instructions })}
            manufacturerId={manufacturerId}
            label="Custom Instructions for AI Agent"
            modalTitle={serviceType.name}
          />
        </div>
      )}
    </div>
  );
}

// ── Instruction Modal ────────────────────────────────

function InstructionModal({
  manufacturerId,
  serviceTypeName,
  onSave,
  onClose,
}: {
  manufacturerId: string;
  serviceTypeName: string;
  onSave: (instruction: CustomInstruction) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"text" | "file">("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim()) return;
    const id = crypto.randomUUID();

    if (type === "text") {
      if (!content.trim()) return;
      onSave({ id, title: title.trim(), type: "text", content: content.trim() });
    } else {
      if (!file) return;
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("manufacturerId", manufacturerId);
      formData.append("instructionId", id);

      try {
        const res = await fetch("/api/admin/upload-instruction", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setUploading(false);
          return;
        }

        onSave({
          id,
          title: title.trim(),
          type: "file",
          fileName: file.name,
          filePath: data.filePath,
        });
      } catch {
        setError("Upload failed. Please try again.");
        setUploading(false);
        return;
      }
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 py-2 text-[13px] font-medium border-none cursor-pointer rounded-lg transition-all ${
      active
        ? "bg-white text-[#4F46E5] shadow-sm"
        : "bg-transparent text-[#6B7280]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white border border-[#E5E7EB] rounded-xl p-6 w-full max-w-md shadow-xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base text-[#111827]">
            Add Instruction — {serviceTypeName}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center cursor-pointer border-none hover:bg-[#E5E7EB] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pricing Policy"
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111111] outline-none focus:border-[#4F46E5] transition-colors"
            />
          </div>

          {/* Type Toggle */}
          <div className="flex gap-1 bg-[#F3F4F6] rounded-lg p-1">
            <button onClick={() => setType("text")} className={tabClass(type === "text")}>
              Text
            </button>
            <button onClick={() => setType("file")} className={tabClass(type === "file")}>
              File Upload
            </button>
          </div>

          {/* Content */}
          {type === "text" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Enter instructions for the AI agent..."
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111111] outline-none focus:border-[#4F46E5] transition-colors resize-y"
            />
          ) : (
            <div>
              {file ? (
                <div className="flex items-center justify-between px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <Upload className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                    <span className="text-sm text-[#111827] truncate">{file.name}</span>
                    <span className="text-[10px] text-[#9CA3AF] shrink-0">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors bg-transparent border-none cursor-pointer p-0 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#4F46E5] transition-colors">
                  <Upload className="w-6 h-6 text-[#9CA3AF] mb-2" />
                  <span className="text-sm text-[#6B7280]">Click to upload a file</span>
                  <span className="text-[10px] text-[#9CA3AF] mt-1">PDF, DOC, TXT (max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFile(f);
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-[#EF4444] bg-[#FEE2E2] border border-[#EF4444]/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={
              !title.trim() ||
              (type === "text" && !content.trim()) ||
              (type === "file" && !file) ||
              uploading
            }
            className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg border-none cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Save Instruction"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Qualifications Editor ────────────────────────────

function QualificationsEditor({
  qualifications,
  onChange,
}: {
  qualifications: Qualification[];
  onChange: (next: Qualification[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function addQualification() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const key = slugifyKey(trimmed);
    if (!key || qualifications.some((q) => q.key === key)) {
      setDraft("");
      setAdding(false);
      return;
    }
    onChange([
      ...qualifications,
      { id: crypto.randomUUID(), label: trimmed, key },
    ]);
    setDraft("");
    setAdding(false);
  }

  function updateLabel(id: string, label: string) {
    onChange(
      qualifications.map((q) =>
        q.id === id ? { ...q, label, key: slugifyKey(label) } : q
      )
    );
  }

  function remove(id: string) {
    onChange(qualifications.filter((q) => q.id !== id));
  }

  return (
    <div className="space-y-2">
      {qualifications.map((q) => (
        <div
          key={q.id}
          className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg"
        >
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={q.label}
              onChange={(e) => updateLabel(q.id, e.target.value)}
              placeholder="e.g. Estimated Volume"
              className="w-full px-0 py-0 bg-transparent text-sm text-[#111827] outline-none border-none"
            />
            <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">
              key: {q.key || "—"}
            </p>
          </div>
          <button
            onClick={() => remove(q.id)}
            className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors bg-transparent border-none cursor-pointer p-0 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQualification();
              }
              if (e.key === "Escape") {
                setDraft("");
                setAdding(false);
              }
            }}
            placeholder="e.g. Target Launch Date"
            className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111111] outline-none focus:border-[#4F46E5]"
          />
          <button
            onClick={addQualification}
            disabled={!draft.trim()}
            className="px-3 py-2 bg-[#4F46E5] text-white text-sm rounded-lg border-none cursor-pointer hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
          <button
            onClick={() => {
              setDraft("");
              setAdding(false);
            }}
            className="px-3 py-2 text-[#6B7280] text-sm bg-transparent border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#F3F4F6]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 text-xs text-[#4F46E5] font-medium cursor-pointer bg-transparent border-none p-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Qualification
        </button>
      )}
    </div>
  );
}

// ── Tag Input ────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  addLabel,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  addLabel: string;
  placeholder: string;
}) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  function add() {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setValue("");
    setAdding(false);
  }

  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] text-[#4F46E5] text-xs font-medium rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="text-[#4F46E5]/60 hover:text-[#4F46E5] transition-colors bg-transparent border-none cursor-pointer p-0 leading-none"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {adding ? (
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
            if (e.key === "Escape") { setValue(""); setAdding(false); }
          }}
          onBlur={add}
          placeholder={placeholder}
          className="px-3 py-1.5 border border-[#E5E7EB] rounded-full text-xs text-[#111111] outline-none focus:border-[#4F46E5] w-40"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 text-xs text-[#4F46E5] font-medium cursor-pointer bg-transparent border-none p-0"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
