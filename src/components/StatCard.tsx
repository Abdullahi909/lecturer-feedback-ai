// StatCard — a small summary card used on the dashboard and approved pages.
// Shows an icon, a big number (or text), a label, and an optional note below.

import { LucideIcon } from "lucide-react";

type Props = {
  label: string;       // Text above the value, e.g. "Pending Feedback"
  value: string | number; // The big number or text in the middle
  icon: LucideIcon;    // Icon component from lucide-react
  iconColor: string;   // Icon colour, e.g. "#d97706"
  iconBg: string;      // Icon background colour, e.g. "#fef3c7"
  note?: string;       // Optional small text below the value
};

export default function StatCard({ label, value, icon: Icon, iconColor, iconBg, note }: Props) {
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "10px", padding: "20px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: "16px" }}>
      {/* Coloured icon box */}
      <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={iconColor} />
      </div>
      {/* Text content */}
      <div>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>{label}</p>
        <p style={{ fontSize: "26px", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>{value}</p>
        {note && <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>{note}</p>}
      </div>
    </div>
  );
}
