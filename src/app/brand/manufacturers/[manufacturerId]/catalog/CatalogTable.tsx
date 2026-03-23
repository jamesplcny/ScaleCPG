"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, FileText, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { submitCatalogRequestAction } from "./actions";

type CatalogItem = {
  id: string;
  item_name: string;
  ingredient_list: string;
  selling_points: string[];
  packaging_names: string[];
  accessory_names: string[];
  moq: number;
};

interface CatalogCardsProps {
  items: CatalogItem[];
  manufacturerId: string;
  manufacturerName: string;
}

export function CatalogCards({ items, manufacturerId, manufacturerName }: CatalogCardsProps) {
  const router = useRouter();

  // Modal state
  const [compositionItem, setCompositionItem] = useState<CatalogItem | null>(null);
  const [sampleItem, setSampleItem] = useState<CatalogItem | null>(null);
  const [quoteItem, setQuoteItem] = useState<CatalogItem | null>(null);

  // Form state
  const [sampleBody, setSampleBody] = useState("");
  const [modifications, setModifications] = useState("");
  const [desiredQuantity, setDesiredQuantity] = useState("");
  const [selectedPackaging, setSelectedPackaging] = useState("");
  const [customPackaging, setCustomPackaging] = useState("");
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [additionalComments, setAdditionalComments] = useState("");
  const [compositionOpen, setCompositionOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function resetForms() {
    setSampleBody("");
    setModifications("");
    setDesiredQuantity("");
    setSelectedPackaging("");
    setCustomPackaging("");
    setSelectedAccessories([]);
    setAdditionalComments("");
    setCompositionOpen(false);
    setError("");
  }

  async function handleSampleSubmit() {
    if (!sampleItem || !sampleBody.trim()) return;
    setLoading(true);
    setError("");

    const result = await submitCatalogRequestAction({
      manufacturerId,
      catalogItemId: sampleItem.id,
      itemName: sampleItem.item_name,
      requestType: "sample_request",
      requestBody: sampleBody,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSampleItem(null);
    resetForms();
    router.refresh();
  }

  async function handleQuoteSubmit() {
    if (!quoteItem || !desiredQuantity.trim()) return;
    setLoading(true);
    setError("");

    const packagingValue = selectedPackaging === "__other__"
      ? (customPackaging.trim() || null)
      : (selectedPackaging || null);

    const result = await submitCatalogRequestAction({
      manufacturerId,
      catalogItemId: quoteItem.id,
      itemName: quoteItem.item_name,
      requestType: "quote_request",
      requestBody: modifications,
      desiredQuantity: desiredQuantity.trim(),
      ingredientList: quoteItem.ingredient_list,
      packagingSelection: packagingValue,
      accessorySelections: selectedAccessories.length > 0 ? selectedAccessories : null,
      additionalComments: additionalComments.trim() || null,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setQuoteItem(null);
    resetForms();
    router.refresh();
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-sm font-sans text-text-primary outline-none transition-colors focus:border-accent-gold resize-none";

  const btnBase =
    "inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg border cursor-pointer transition-all whitespace-nowrap";

  if (items.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
        <p className="text-text-muted text-sm">This manufacturer has no catalog items listed yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="bg-bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-in-up flex flex-col"
            style={{ animationDelay: `${0.03 + i * 0.04}s` }}
          >
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1">
              {manufacturerName}
            </p>
            <h4 className="font-semibold text-base text-text-primary mb-2">
              {item.item_name}
            </h4>

            {/* Product features */}
            {item.selling_points.length > 0 && (
              <ul className="mb-3 space-y-0.5">
                {item.selling_points.map((point, j) => (
                  <li key={j} className="text-[12px] text-text-secondary flex items-start gap-1.5">
                    <span className="text-accent-sage mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-5 mb-4 text-[13px]">
              <div>
                <span className="text-text-muted text-[11px] uppercase tracking-wider block mb-0.5">MOQ</span>
                <span className="text-text-primary font-medium">{item.moq.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-border">
              <button
                onClick={() => setCompositionItem(item)}
                className={`${btnBase} bg-bg-secondary text-text-secondary border-border hover:bg-border`}
              >
                <Eye className="w-3 h-3" strokeWidth={2} />
                View Product Composition
              </button>
              <button
                onClick={() => { resetForms(); setSampleItem(item); }}
                className={`${btnBase} bg-accent-gold/10 text-accent-gold border-accent-gold/20 hover:bg-accent-gold/20`}
              >
                <FlaskConical className="w-3 h-3" strokeWidth={2} />
                Request Sample
              </button>
              <button
                onClick={() => { resetForms(); setQuoteItem(item); }}
                className={`${btnBase} bg-accent-sage/10 text-accent-sage border-accent-sage/20 hover:bg-accent-sage/20`}
              >
                <FileText className="w-3 h-3" strokeWidth={2} />
                Get Quote
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Product Composition Modal */}
      {compositionItem && (
        <Modal
          open={true}
          onClose={() => setCompositionItem(null)}
          title="Product Composition"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div>
              <span className="text-[11px] text-text-muted uppercase tracking-wider">Item Name</span>
              <p className="text-sm text-text-primary font-medium mt-1">{compositionItem.item_name}</p>
            </div>
            <div>
              <span className="text-[11px] text-text-muted uppercase tracking-wider">Ingredient List</span>
              <p className="text-[13px] text-text-secondary mt-1 whitespace-pre-wrap leading-relaxed">
                {compositionItem.ingredient_list || "—"}
              </p>
            </div>
            {compositionItem.packaging_names.length > 0 && (
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">Common Packaging</span>
                <p className="text-[13px] text-text-secondary mt-1">
                  {compositionItem.packaging_names.join(", ")}
                </p>
              </div>
            )}
            {compositionItem.accessory_names.length > 0 && (
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">Accessories</span>
                <p className="text-[13px] text-text-secondary mt-1">
                  {compositionItem.accessory_names.join(", ")}
                </p>
              </div>
            )}
            {compositionItem.selling_points.length > 0 && (
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">Product Features</span>
                <ul className="mt-1 space-y-0.5">
                  {compositionItem.selling_points.map((pt, j) => (
                    <li key={j} className="text-[13px] text-text-secondary flex items-start gap-1.5">
                      <span className="text-accent-sage mt-0.5">•</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 pt-5 border-t border-border">
            <button
              onClick={() => setCompositionItem(null)}
              className="px-4 py-2 bg-transparent border border-border rounded-lg text-sm font-medium text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary font-sans"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Request Sample Modal */}
      {sampleItem && (
        <Modal
          open={true}
          onClose={() => setSampleItem(null)}
          title="Send Sample Request to Manufacturer"
          maxWidth="max-w-lg"
        >
          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            This will send a request directly to your manufacturer and will also appear in your chat. Follow up accordingly.
          </p>

          {error && (
            <div className="text-sm text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-lg px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          <div className="mb-2">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Item</span>
            <p className="text-sm text-text-primary font-medium mt-1">{sampleItem.item_name}</p>
          </div>

          <div className="mt-4">
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
              Details / Notes
            </label>
            <textarea
              value={sampleBody}
              onChange={(e) => setSampleBody(e.target.value)}
              rows={4}
              placeholder="e.g. I'd like to request a sample of this product for evaluation..."
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-border">
            <button
              onClick={() => setSampleItem(null)}
              className="px-4 py-2 bg-transparent border border-border rounded-lg text-sm font-medium text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary font-sans"
            >
              Cancel
            </button>
            <button
              onClick={handleSampleSubmit}
              disabled={!sampleBody.trim() || loading}
              className="px-4 py-2 bg-text-primary border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:opacity-90 font-sans disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </Modal>
      )}

      {/* Get Quote Modal */}
      {quoteItem && (
        <Modal
          open={true}
          onClose={() => setQuoteItem(null)}
          title="Get Quote"
          maxWidth="max-w-lg"
        >
          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            Request a quote from your manufacturer. This will also appear in your chat.
          </p>

          {error && (
            <div className="text-sm text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-lg px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <span className="text-[11px] text-text-muted uppercase tracking-wider">Item Name</span>
              <p className="text-sm text-text-primary font-medium mt-1">{quoteItem.item_name}</p>
            </div>

            {/* Collapsible Product Composition */}
            <div className="bg-bg-secondary rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setCompositionOpen(!compositionOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
              >
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Product Composition</span>
                {compositionOpen ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" strokeWidth={2} />
                )}
              </button>
              {compositionOpen && (
                <div className="px-4 pb-3 space-y-2">
                  <div>
                    <span className="text-[10px] text-text-muted">Ingredients</span>
                    <p className="text-[12px] text-text-secondary whitespace-pre-wrap leading-relaxed">
                      {quoteItem.ingredient_list || "—"}
                    </p>
                  </div>
                  {quoteItem.packaging_names.length > 0 && (
                    <div>
                      <span className="text-[10px] text-text-muted">Packaging Options</span>
                      <p className="text-[12px] text-text-secondary">{quoteItem.packaging_names.join(", ")}</p>
                    </div>
                  )}
                  {quoteItem.accessory_names.length > 0 && (
                    <div>
                      <span className="text-[10px] text-text-muted">Accessories</span>
                      <p className="text-[12px] text-text-secondary">{quoteItem.accessory_names.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Packaging selection */}
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Packaging Options
              </label>
              <select
                value={selectedPackaging}
                onChange={(e) => { setSelectedPackaging(e.target.value); if (e.target.value !== "__other__") setCustomPackaging(""); }}
                className={`${inputClass} appearance-auto`}
              >
                <option value="">Select packaging...</option>
                {quoteItem.packaging_names.map((name, j) => (
                  <option key={j} value={name}>{name}</option>
                ))}
                <option value="__other__">Other</option>
              </select>
              {selectedPackaging === "__other__" && (
                <input
                  type="text"
                  value={customPackaging}
                  onChange={(e) => setCustomPackaging(e.target.value)}
                  placeholder="What packaging would you like?"
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>

            {/* Accessory selection */}
            {quoteItem.accessory_names.length > 0 && (
              <div>
                <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                  Add Accessories
                </label>
                <div className="space-y-1.5">
                  {quoteItem.accessory_names.map((name, j) => (
                    <label key={j} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAccessories.includes(name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAccessories((prev) => [...prev, name]);
                          } else {
                            setSelectedAccessories((prev) => prev.filter((n) => n !== name));
                          }
                        }}
                        className="accent-accent-gold"
                      />
                      <span className="text-sm text-text-secondary">{name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Desired First Order Quantity
              </label>
              <input
                type="text"
                value={desiredQuantity}
                onChange={(e) => setDesiredQuantity(e.target.value)}
                placeholder="e.g. 500 units"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Request Modifications
              </label>
              <textarea
                value={modifications}
                onChange={(e) => setModifications(e.target.value)}
                rows={3}
                placeholder="Describe any modifications you'd like to this product..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Additional Comments
              </label>
              <textarea
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                rows={3}
                placeholder="Any additional comments or questions..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-border">
            <button
              onClick={() => setQuoteItem(null)}
              className="px-4 py-2 bg-transparent border border-border rounded-lg text-sm font-medium text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary font-sans"
            >
              Cancel
            </button>
            <button
              onClick={handleQuoteSubmit}
              disabled={!desiredQuantity.trim() || loading}
              className="px-4 py-2 bg-text-primary border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:opacity-90 font-sans disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
