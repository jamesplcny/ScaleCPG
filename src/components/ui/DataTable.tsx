import { cn } from "@/lib/utils";

interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ headers, children, className }: DataTableProps) {
  return (
    <div className={cn("bg-bg-card border border-border rounded-[16px] overflow-hidden opacity-0 animate-fade-in-up", className)} style={{ animationDelay: "0.2s" }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-4 text-[11px] font-semibold text-text-muted uppercase tracking-[1px] border-b border-border bg-bg-secondary"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="transition-colors duration-150 hover:bg-bg-secondary [&:last-child>td]:border-b-0">
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-5 py-5 text-[13px] border-b border-border align-middle", className)}>
      {children}
    </td>
  );
}
