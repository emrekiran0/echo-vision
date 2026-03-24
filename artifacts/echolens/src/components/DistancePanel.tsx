interface Props {
  label: string;
  sublabel: string;
  value: number;
  alert: boolean;
  blinkOn: boolean;
  side: "left" | "right";
}

function getZoneColor(dist: number): { color: string; label: string } {
  if (dist < 0) return { color: "#4a4a6a", label: "NO SIGNAL" };
  if (dist < 30) return { color: "#ff1744", label: "CRITICAL" };
  if (dist < 50) return { color: "#ff9100", label: "WARNING" };
  if (dist < 100) return { color: "#ffd600", label: "CAUTION" };
  return { color: "#00e676", label: "CLEAR" };
}

export default function DistancePanel({ label, sublabel, value, alert, blinkOn, side }: Props) {
  const zone = getZoneColor(value);
  const pct = Math.max(0, Math.min(100, ((200 - Math.max(0, value)) / 200) * 100));

  const borderColor = alert
    ? blinkOn ? "#ff1744" : "#4a0000"
    : "#1e1e2e";

  const bgGlow = alert
    ? blinkOn ? "rgba(255,23,68,0.12)" : "rgba(255,23,68,0.04)"
    : "transparent";

  return (
    <div
      className="rounded-xl border p-4 transition-all duration-200"
      style={{
        background: `#0c0c18`,
        borderColor,
        boxShadow: alert && blinkOn ? `0 0 20px rgba(255,23,68,0.3)` : "none",
      }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div
            className="text-[10px] tracking-[0.2em] text-[#4a4a6a]"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            {label}
          </div>
          <div className="text-[9px] text-[#2e2e4e] mt-0.5">{sublabel}</div>
        </div>
        <div
          className="text-[9px] px-2 py-0.5 rounded-full border font-bold tracking-widest"
          style={{
            color: zone.color,
            borderColor: `${zone.color}40`,
            background: `${zone.color}10`,
            fontFamily: "'Orbitron', monospace",
          }}
        >
          {zone.label}
        </div>
      </div>

      {/* Distance display */}
      <div className="flex items-end gap-1 mb-3">
        <span
          className="text-4xl font-bold tabular-nums leading-none"
          style={{
            color: zone.color,
            fontFamily: "'Orbitron', monospace",
            textShadow: `0 0 12px ${zone.color}60`,
          }}
        >
          {value < 0 ? "---" : String(value).padStart(3, " ")}
        </span>
        <span className="text-[11px] text-[#4a4a6a] mb-1">cm</span>
      </div>

      {/* Proximity bar */}
      <div className="relative h-2 rounded-full bg-[#1a1a28] overflow-hidden mb-2">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, #00e676, ${zone.color})`,
            boxShadow: `0 0 8px ${zone.color}80`,
          }}
        />
      </div>

      {/* Proximity scale */}
      <div className="flex justify-between text-[8px] text-[#2e2e4e] tabular-nums">
        <span>200cm</span>
        <span>100cm</span>
        <span>50cm</span>
        <span>0cm</span>
      </div>

      {/* Alert badge */}
      {alert && (
        <div
          className={`mt-3 text-center text-[10px] font-bold tracking-widest py-1.5 rounded-lg border transition-all ${
            blinkOn
              ? "text-[#ffd600] border-[#ffd600]/30 bg-[#ffd600]/10"
              : "text-[#ff1744] border-[#ff1744]/20 bg-transparent"
          }`}
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          {side === "left" ? "◀" : "▶"} BLIND SPOT ALERT
        </div>
      )}
    </div>
  );
}
