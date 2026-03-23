"use client";

import { useState } from "react";
import { Search, Plus, MapPin, Trash2 } from "lucide-react";
import { AddProductModal } from "./AddProductModal";
import { deleteBrandProduct } from "@/app/brand/dashboard/actions";

type Manufacturer = {
  id: string;
  company_name: string;
  location: string;
  moq: string;
  capabilities: string[];
};

type BrandProduct = {
  id: string;
  name: string;
  sku: string | null;
  status: string;
  created_at: string;
};

interface Props {
  manufacturers: Manufacturer[];
  products: BrandProduct[];
}

export function BrandDashboardClient({ manufacturers, products }: Props) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = manufacturers.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.company_name.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q) ||
      m.capabilities.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* View Manufacturers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-text-primary">
            View Manufacturers
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or capability..."
              className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none focus:border-accent-rose"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">
            {manufacturers.length === 0
              ? "No manufacturers listed yet."
              : "No manufacturers match your search."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="bg-bg-card border border-border rounded-xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <h4 className="font-sans font-medium text-sm text-text-primary mb-1">
                  {m.company_name}
                </h4>
                <p className="text-xs text-text-secondary flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" />
                  {m.location}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                  <span>MOQ: {m.moq}</span>
                </div>
                {m.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 bg-accent-sage/10 text-accent-sage text-[11px] rounded-full"
                      >
                        {cap}
                      </span>
                    ))}
                    {m.capabilities.length > 3 && (
                      <span className="px-2 py-0.5 text-text-muted text-[11px]">
                        +{m.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-text-primary">
            My Products
          </h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg border-none cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">
            No products yet. Click &quot;Add Product&quot; to create your first one.
          </p>
        ) : (
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">
                    SKU
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">
                    Created
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-text-primary">
                      {p.name}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {p.sku || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 bg-accent-rose/10 text-accent-rose text-xs rounded-full capitalize">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => deleteBrandProduct(p.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none bg-transparent transition-colors hover:bg-accent-teal/10"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-accent-teal" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AddProductModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
