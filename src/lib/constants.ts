import {
  Home,
  Users,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Building2,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Sales Leads", href: "/sales-leads", icon: MessageSquare },
] as const;

export const BRAND_NAV_ITEMS = [
  { label: "Home", href: "/brand/dashboard", icon: Home },
  { label: "Status Report", href: "/brand/status-report", icon: BarChart3 },
  { label: "Open Requests", href: "/brand/open-requests", icon: ClipboardList },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Manufacturers", href: "/admin/manufacturers", icon: Building2 },
] as const;

/** Routes that need sidebar/auth but aren't in the main nav arrays */
export const EXTRA_PROTECTED_ROUTES = ["/admin"] as const;

export const STATUS_COLORS = {
  pending: { bg: "bg-accent-plum/12", text: "text-accent-plum" },
  approved: { bg: "bg-accent-sage/12", text: "text-accent-sage" },
  production: { bg: "bg-accent-rose/12", text: "text-accent-rose" },
  shipped: { bg: "bg-accent-sage/12", text: "text-accent-sage" },
  "in-stock": { bg: "bg-accent-sage/12", text: "text-accent-sage" },
  "low-stock": { bg: "bg-accent-plum/12", text: "text-accent-plum" },
  critical: { bg: "bg-accent-teal/12", text: "text-accent-teal" },
  "on-order": { bg: "bg-accent-rose/12", text: "text-accent-rose" },
} as const;

export const ACCENT_COLORS = {
  rose: { color: "#4F46E5", light: "#EEF2FF" },
  gold: { color: "#4338CA", light: "#C7D2FE" },
  sage: { color: "#10B981", light: "#D1FAE5" },
  plum: { color: "#F59E0B", light: "#FEF3C7" },
  teal: { color: "#EF4444", light: "#FEE2E2" },
} as const;
