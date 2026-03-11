import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  note?: string;
};

export default function StatCard({ label, value, icon: Icon, iconColor, iconBg, note }: Props) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        padding: "20px",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>{label}</p>
        <p style={{ fontSize: "26px", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>{value}</p>
        {note && (
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>{note}</p>
        )}
      </div>
    </div>
  );
}
