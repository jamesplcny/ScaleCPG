"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Package, Star, Gem, Check, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  createCatalogItemAction,
  updateCatalogItemAction,
  deleteCatalogItemAction,
  createPackagingAction,
  updatePackagingAction,
  deletePackagingAction,
  createAccessoryAction,
  updateAccessoryAction,
  deleteAccessoryAction,
} from "./actions";

const inputClass = "w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none transition-colors focus:border-accent-rose";
const labelClass = "block text-[11px] text-text-muted uppercase tracking-wider mb-2";

// ── Product Catalog ──────────────────────────────────────

interface CatalogItem {
  id: string;
  item_name: string;
  ingredient_list: string;
  selling_points: string[];
  packaging_ids: string[];
  accessory_ids: string[];
  packaging_names: string[];
  accessory_names: string[];
  how_to_use: string;
  moq: number;
  created_at: string;
}

interface NamedOption {
  id: string;
  name: string;
}

export function ProductCatalogSection({
  items,
  packagingOptions,
  accessoryOptions,
}: {
  items: CatalogItem[];
  packagingOptions: NamedOption[];
  accessoryOptions: NamedOption[];
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<CatalogItem | null>(null);
  const [viewItem, setViewItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Packaging + Accessories picker modal
  const [pickerOpen, setPickerOpen] = useState(false);

  const emptyForm = {
    item_name: "",
    ingredient_list: "",
    selling_points: [""] as string[],
    packaging_ids: [] as string[],
    accessory_ids: [] as string[],
    how_to_use: "",
    moq: "",
  };
  const [form, setForm] = useState(emptyForm);

  function update(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openAdd() { setForm(emptyForm); setError(""); setAddOpen(true); }
  function closeAdd() { setForm(emptyForm); setError(""); setAddOpen(false); }

  function openEdit(item: CatalogItem) {
    setForm({
      item_name: item.item_name,
      ingredient_list: item.ingredient_list,
      selling_points: item.selling_points.length > 0 ? [...item.selling_points] : [""],
      packaging_ids: [...item.packaging_ids],
      accessory_ids: [...item.accessory_ids],
      how_to_use: item.how_to_use ?? "",
      moq: String(item.moq),
    });
    setError("");
    setEditItem(item);
  }
  function closeEdit() { setForm(emptyForm); setError(""); setEditItem(null); }

  function parseFormData() {
    const moq = parseInt(form.moq, 10);
    if (isNaN(moq) || moq < 0) return { error: "MOQ must be a non-negative number" };

    return {
      data: {
        item_name: form.item_name,
        ingredient_list: form.ingredient_list,
        selling_points: form.selling_points.filter((s) => s.trim()),
        packaging_ids: form.packaging_ids,
        accessory_ids: form.accessory_ids,
        how_to_use: form.how_to_use,
        moq,
      },
    };
  }

  async function handleCreate() {
    if (!form.item_name.trim() || !form.ingredient_list.trim() || !form.moq.trim()) return;
    const parsed = parseFormData();
    if ("error" in parsed) { setError(parsed.error as string); return; }
    setLoading(true); setError("");
    const result = await createCatalogItemAction(parsed.data);
    if (result.error) { setError(result.error); setLoading(false); return; }
    closeAdd(); setLoading(false); router.refresh();
  }

  async function handleUpdate() {
    if (!editItem || !form.item_name.trim() || !form.ingredient_list.trim() || !form.moq.trim()) return;
    const parsed = parseFormData();
    if ("error" in parsed) { setError(parsed.error as string); return; }
    setLoading(true); setError("");
    const result = await updateCatalogItemAction(editItem.id, parsed.data);
    if (result.error) { setError(result.error); setLoading(false); return; }
    closeEdit(); setLoading(false); router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteCatalogItemAction(id);
    setDeleting(null);
    router.refresh();
  }

  // Selling points helpers
  function updateSellingPoint(index: number, value: string) {
    const pts = [...form.selling_points];
    pts[index] = value;
    update("selling_points", pts);
  }
  function addSellingPoint() {
    update("selling_points", [...form.selling_points, ""]);
  }
  function removeSellingPoint(index: number) {
    const pts = form.selling_points.filter((_, i) => i !== index);
    update("selling_points", pts.length > 0 ? pts : [""]);
  }

  // Toggle packaging/accessory selection
  function toggleId(field: "packaging_ids" | "accessory_ids", id: string) {
    const current = form[field];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    update(field, next);
  }

  // Resolve names for display
  const selectedPkgItems = form.packaging_ids.map((id) => packagingOptions.find((p) => p.id === id)).filter(Boolean) as NamedOption[];
  const selectedAccItems = form.accessory_ids.map((id) => accessoryOptions.find((a) => a.id === id)).filter(Boolean) as NamedOption[];
  const hasSelections = selectedPkgItems.length > 0 || selectedAccItems.length > 0;

  const isFormValid = form.item_name.trim() && form.ingredient_list.trim() && form.moq.trim();

  const formFields = (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Item Name *</label>
        <input type="text" value={form.item_name} onChange={(e) => update("item_name", e.target.value)} placeholder="e.g. Vitamin C Serum" autoFocus className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Ingredient List *</label>
        <textarea value={form.ingredient_list} onChange={(e) => update("ingredient_list", e.target.value)} placeholder="e.g. Aqua, Ascorbic Acid, Glycerin..." rows={3} className={`${inputClass} resize-y`} />
      </div>
      <div>
        <label className={labelClass}>Product Features</label>
        <div className="space-y-2">
          {form.selling_points.map((point, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] text-text-muted">•</span>
              <input
                type="text"
                value={point}
                onChange={(e) => updateSellingPoint(i, e.target.value)}
                placeholder="e.g. Brightens skin, reduces dark spots"
                className={`${inputClass} flex-1`}
              />
              {form.selling_points.length > 1 && (
                <button onClick={() => removeSellingPoint(i)} className="text-text-muted hover:text-accent-teal transition-colors" type="button">
                  <Trash2 className="w-3 h-3" strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
          <button onClick={addSellingPoint} type="button" className="inline-flex items-center gap-1 text-[11px] text-accent-rose font-medium hover:text-accent-teal/80 transition-colors">
            <Plus className="w-3 h-3" strokeWidth={2} />
            Add bullet point
          </button>
        </div>
      </div>
      <div>
        <label className={labelClass}>How to Use</label>
        <textarea value={form.how_to_use} onChange={(e) => update("how_to_use", e.target.value)} placeholder="e.g. Apply a small amount to clean skin morning and evening..." rows={3} className={`${inputClass} resize-y`} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass + " mb-0"}>Common Packaging + Accessories</label>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] text-accent-rose font-medium hover:text-accent-teal/80 transition-colors"
          >
            <Plus className="w-3 h-3" strokeWidth={2} />
            Add Items
          </button>
        </div>
        {hasSelections ? (
          <div className="space-y-1.5">
            {selectedPkgItems.map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between px-3 py-2 bg-bg-secondary border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3 text-accent-rose shrink-0" strokeWidth={2} />
                  <span className="text-[13px] text-text-primary">{pkg.name}</span>
                </div>
                <button type="button" onClick={() => toggleId("packaging_ids", pkg.id)} className="text-text-muted hover:text-accent-teal transition-colors">
                  <Trash2 className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            ))}
            {selectedAccItems.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between px-3 py-2 bg-bg-secondary border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Gem className="w-3 h-3 text-accent-teal shrink-0" strokeWidth={2} />
                  <span className="text-[13px] text-text-primary">{acc.name}</span>
                </div>
                <button type="button" onClick={() => toggleId("accessory_ids", acc.id)} className="text-text-muted hover:text-accent-teal transition-colors">
                  <Trash2 className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-text-muted">None</p>
        )}
      </div>
      <div>
        <label className={labelClass}>MOQ *</label>
        <input type="text" inputMode="numeric" value={form.moq} onChange={(e) => update("moq", e.target.value)} placeholder="e.g. 500" className={inputClass} />
      </div>
    </div>
  );

  return (
    <VaultSectionShell
      title="Product Catalog"
      count={items.length}
      icon={<Star className="w-5 h-5 text-accent-plum" strokeWidth={1.5} />}
      accentClass="accent-plum"
      onAdd={openAdd}
    >
      {items.length === 0 ? (
        <p className="text-sm text-text-muted py-4">No catalog items yet. Click &quot;+ Add&quot; to get started.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 px-4 bg-bg-secondary/50 rounded-lg opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.02 + i * 0.02}s` }}
            >
              <span className="text-[13px] text-text-primary font-medium truncate mr-3">{item.item_name}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setViewItem(item)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-transparent border border-border text-[11px] font-medium text-text-secondary cursor-pointer transition-all hover:border-accent-plum/40 hover:text-accent-plum hover:bg-accent-plum/[0.06]"
                >
                  <Eye className="w-3 h-3" strokeWidth={2} />
                  View Details
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-transparent border-none cursor-pointer transition-colors hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose"
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-transparent border-none cursor-pointer transition-colors hover:bg-accent-teal/10 text-text-muted hover:text-accent-teal disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      {viewItem && (
        <Modal open={true} onClose={() => setViewItem(null)} title={viewItem.item_name} maxWidth="max-w-lg">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] text-text-muted uppercase tracking-wider">Ingredient List</span>
              <p className="text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed mt-1">
                {viewItem.ingredient_list || "—"}
              </p>
            </div>
            {viewItem.selling_points.length > 0 && (
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">Product Features</span>
                <ul className="mt-1 space-y-0.5">
                  {viewItem.selling_points.map((pt, j) => (
                    <li key={j} className="text-[13px] text-text-secondary flex items-start gap-1.5">
                      <span className="text-accent-sage mt-0.5">•</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {viewItem.how_to_use && (
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">How to Use</span>
                <p className="text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed mt-1">
                  {viewItem.how_to_use}
                </p>
              </div>
            )}
            {(viewItem.packaging_names.length > 0 || viewItem.accessory_names.length > 0) && (
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">Packaging + Accessories</span>
                <div className="mt-1.5 space-y-1">
                  {viewItem.packaging_names.map((name, j) => (
                    <div key={`pkg-${j}`} className="flex items-center gap-2">
                      <Package className="w-3 h-3 text-accent-rose shrink-0" strokeWidth={2} />
                      <span className="text-[13px] text-text-secondary">{name}</span>
                    </div>
                  ))}
                  {viewItem.accessory_names.map((name, j) => (
                    <div key={`acc-${j}`} className="flex items-center gap-2">
                      <Gem className="w-3 h-3 text-accent-teal shrink-0" strokeWidth={2} />
                      <span className="text-[13px] text-text-secondary">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-[11px] text-text-muted uppercase tracking-wider">MOQ</span>
              <p className="text-[13px] text-text-primary font-medium mt-1">{viewItem.moq.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex justify-end mt-6 pt-5 border-t border-border">
            <button
              onClick={() => setViewItem(null)}
              className="px-4 py-2 bg-transparent border border-border rounded-lg text-sm font-medium text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary font-sans"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={closeAdd} title="Add Catalog Item" maxWidth="max-w-lg">
        {error && <ErrorBanner message={error} />}
        {formFields}
        <ModalFooter onCancel={closeAdd} onConfirm={handleCreate} loading={loading} disabled={!isFormValid} />
      </Modal>

      {/* Edit Modal */}
      {editItem && (
        <Modal open={true} onClose={closeEdit} title="Edit Catalog Item" maxWidth="max-w-lg">
          {error && <ErrorBanner message={error} />}
          {formFields}
          <ModalFooter onCancel={closeEdit} onConfirm={handleUpdate} loading={loading} disabled={!isFormValid} label="Save" />
        </Modal>
      )}

      {/* Packaging + Accessories Picker Modal */}
      {pickerOpen && (
        <Modal open={true} onClose={() => setPickerOpen(false)} title="Select Packaging &amp; Accessories" maxWidth="max-w-md">
          {packagingOptions.length > 0 && (
            <div className="mb-5">
              <span className={labelClass}>Packaging</span>
              <div className="space-y-1.5">
                {packagingOptions.map((pkg) => {
                  const selected = form.packaging_ids.includes(pkg.id);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => toggleId("packaging_ids", pkg.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                        selected ? "bg-accent-rose/10 border border-accent-rose/30 text-accent-rose" : "bg-bg-secondary border border-border text-text-secondary hover:border-accent-rose/40"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? "bg-accent-rose border-accent-rose" : "border-border"}`}>
                        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                      {pkg.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {accessoryOptions.length > 0 && (
            <div className="mb-5">
              <span className={labelClass}>Accessories</span>
              <div className="space-y-1.5">
                {accessoryOptions.map((acc) => {
                  const selected = form.accessory_ids.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleId("accessory_ids", acc.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                        selected ? "bg-accent-teal/10 border border-accent-teal/30 text-accent-teal" : "bg-bg-secondary border border-border text-text-secondary hover:border-accent-teal/40"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? "bg-accent-teal border-accent-teal" : "border-border"}`}>
                        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                      {acc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {packagingOptions.length === 0 && accessoryOptions.length === 0 && (
            <p className="text-sm text-text-muted py-4">No packaging or accessory items in your vault yet. Add them in the Packaging Vault or Accessory Vault sections below.</p>
          )}

          <div className="flex justify-end mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setPickerOpen(false)}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all font-sans"
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </VaultSectionShell>
  );
}

// ── Packaging Vault ───────────────────────────────────────

interface PackagingItem {
  id: string;
  name: string;
  packaging_type: string;
  description: string;
}

export function PackagingVaultSection({ packagingItems }: { packagingItems: PackagingItem[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<PackagingItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", packaging_type: "", description: "" });
  const [deleting, setDeleting] = useState<string | null>(null);

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  function openAdd() { setForm({ name: "", packaging_type: "", description: "" }); setError(""); setAddOpen(true); }
  function closeAdd() { setForm({ name: "", packaging_type: "", description: "" }); setError(""); setAddOpen(false); }

  function openEdit(item: PackagingItem) { setForm({ name: item.name, packaging_type: item.packaging_type, description: item.description }); setError(""); setEditItem(item); }
  function closeEdit() { setForm({ name: "", packaging_type: "", description: "" }); setError(""); setEditItem(null); }

  async function handleCreate() {
    if (!form.name.trim()) return;
    setLoading(true); setError("");
    const result = await createPackagingAction(form);
    if (result.error) { setError(result.error); setLoading(false); return; }
    closeAdd(); setLoading(false); router.refresh();
  }

  async function handleUpdate() {
    if (!editItem || !form.name.trim()) return;
    setLoading(true); setError("");
    const result = await updatePackagingAction(editItem.id, form);
    if (result.error) { setError(result.error); setLoading(false); return; }
    closeEdit(); setLoading(false); router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deletePackagingAction(id);
    setDeleting(null);
    router.refresh();
  }

  return (
    <VaultSectionShell
      title="Packaging Vault"
      count={packagingItems.length}
      icon={<Package className="w-5 h-5 text-accent-rose" strokeWidth={1.5} />}
      accentClass="accent-rose"
      onAdd={openAdd}
    >
      {packagingItems.length === 0 ? (
        <p className="text-sm text-text-muted py-4">No packaging items yet. Click &quot;+ Add&quot; to get started.</p>
      ) : (
        <div className="space-y-2">
          {packagingItems.map((item, i) => (
            <VaultRow key={item.id} index={i} title={item.name} subtitle={item.packaging_type || undefined} onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.id)} deleting={deleting === item.id} />
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={closeAdd} title="Add Packaging" maxWidth="max-w-lg">
        {error && <ErrorBanner message={error} />}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Packaging Name</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. 8oz Amber Glass Bottle" autoFocus className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Packaging Type</label>
            <input type="text" value={form.packaging_type} onChange={(e) => update("packaging_type", e.target.value)} placeholder="e.g. Bottle, Jar, Tube, Pouch" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Optional notes about this packaging..." rows={3} className={`${inputClass} resize-y`} />
          </div>
        </div>
        <ModalFooter onCancel={closeAdd} onConfirm={handleCreate} loading={loading} disabled={!form.name.trim()} />
      </Modal>

      {editItem && (
        <Modal open={true} onClose={closeEdit} title="Edit Packaging" maxWidth="max-w-lg">
          {error && <ErrorBanner message={error} />}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Packaging Name</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} autoFocus className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Packaging Type</label>
              <input type="text" value={form.packaging_type} onChange={(e) => update("packaging_type", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
            </div>
          </div>
          <ModalFooter onCancel={closeEdit} onConfirm={handleUpdate} loading={loading} disabled={!form.name.trim()} label="Save" />
        </Modal>
      )}
    </VaultSectionShell>
  );
}

// ── Accessory Vault ───────────────────────────────────────

interface AccessoryItem {
  id: string;
  name: string;
  description: string;
}

export function AccessoryVaultSection({ accessoryItems }: { accessoryItems: AccessoryItem[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<AccessoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [deleting, setDeleting] = useState<string | null>(null);

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  function openAdd() { setForm({ name: "", description: "" }); setError(""); setAddOpen(true); }
  function closeAdd() { setForm({ name: "", description: "" }); setError(""); setAddOpen(false); }

  function openEdit(item: AccessoryItem) { setForm({ name: item.name, description: item.description }); setError(""); setEditItem(item); }
  function closeEdit() { setForm({ name: "", description: "" }); setError(""); setEditItem(null); }

  async function handleCreate() {
    if (!form.name.trim()) return;
    setLoading(true); setError("");
    const result = await createAccessoryAction(form);
    if (result.error) { setError(result.error); setLoading(false); return; }
    closeAdd(); setLoading(false); router.refresh();
  }

  async function handleUpdate() {
    if (!editItem || !form.name.trim()) return;
    setLoading(true); setError("");
    const result = await updateAccessoryAction(editItem.id, form);
    if (result.error) { setError(result.error); setLoading(false); return; }
    closeEdit(); setLoading(false); router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteAccessoryAction(id);
    setDeleting(null);
    router.refresh();
  }

  return (
    <VaultSectionShell
      title="Accessory Vault"
      count={accessoryItems.length}
      icon={<Gem className="w-5 h-5 text-accent-teal" strokeWidth={1.5} />}
      accentClass="accent-teal"
      onAdd={openAdd}
    >
      {accessoryItems.length === 0 ? (
        <p className="text-sm text-text-muted py-4">No accessories yet. Click &quot;+ Add&quot; to get started.</p>
      ) : (
        <div className="space-y-2">
          {accessoryItems.map((item, i) => (
            <VaultRow key={item.id} index={i} title={item.name} subtitle={item.description || undefined} onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.id)} deleting={deleting === item.id} />
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={closeAdd} title="Add Accessory" maxWidth="max-w-lg">
        {error && <ErrorBanner message={error} />}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Accessory Name</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Dropper cap, Pump dispenser" autoFocus className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Optional notes about this accessory..." rows={3} className={`${inputClass} resize-y`} />
          </div>
        </div>
        <ModalFooter onCancel={closeAdd} onConfirm={handleCreate} loading={loading} disabled={!form.name.trim()} />
      </Modal>

      {editItem && (
        <Modal open={true} onClose={closeEdit} title="Edit Accessory" maxWidth="max-w-lg">
          {error && <ErrorBanner message={error} />}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Accessory Name</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} autoFocus className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
            </div>
          </div>
          <ModalFooter onCancel={closeEdit} onConfirm={handleUpdate} loading={loading} disabled={!form.name.trim()} label="Save" />
        </Modal>
      )}
    </VaultSectionShell>
  );
}

// ── Shared Components ─────────────────────────────────────

function VaultSectionShell({
  title,
  count,
  icon,
  accentClass,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  accentClass: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-bg-card border border-border rounded-[16px] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-lg text-text-primary">{title}</h3>
          <span className="text-[12px] text-text-muted">({count})</span>
        </div>
        <button
          onClick={onAdd}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-border rounded-lg font-sans text-xs font-medium text-text-secondary cursor-pointer transition-all hover:border-${accentClass} hover:text-${accentClass} hover:bg-${accentClass}/[0.06]`}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Add
        </button>
      </div>
      {children}
    </section>
  );
}

function VaultRow({
  index,
  title,
  subtitle,
  onEdit,
  onDelete,
  deleting,
}: {
  index: number;
  title: string;
  subtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 px-4 bg-bg-secondary/50 rounded-lg opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${0.02 + index * 0.02}s` }}
    >
      <div className="truncate mr-3">
        <span className="text-[13px] text-text-primary font-medium">{title}</span>
        {subtitle && <span className="text-[11px] text-text-muted ml-2">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-transparent border-none cursor-pointer transition-colors hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-transparent border-none cursor-pointer transition-colors hover:bg-accent-teal/10 text-text-muted hover:text-accent-teal disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5 mb-4">{message}</div>
  );
}

function ModalFooter({
  onCancel,
  onConfirm,
  loading,
  disabled,
  label = "Create",
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  disabled: boolean;
  label?: string;
}) {
  return (
    <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-border">
      <button onClick={onCancel} className="px-4 py-2 bg-transparent border border-border rounded-lg text-sm font-medium text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary font-sans">Cancel</button>
      <button onClick={onConfirm} disabled={disabled || loading} className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed">
        {loading ? (label === "Save" ? "Saving..." : "Creating...") : label}
      </button>
    </div>
  );
}
