interface Props {
  emergency: boolean;
}

interface StatusItem {
  label: string;
  sublabel: string;
  status: "online" | "active" | "streaming";
  color: string;
  value?: string;
}

export default function SystemStatus({ emergency }: Props) {
  const items: StatusItem[] = [
    { label: "ESP-NOW", sublabel: "Kart1 → Kart2", status: "online", color: "#00e676", value: "4ms" },
    { label: "WiFi", sublabel: "2.4 GHz b/g/n", status: "online", color: "#00e676", value: "-52dBm" },
    { label: "ThingSpeak", sublabel: "Cloud IoT", status: "streaming", color: "#00e5ff", value: "15s" },
    { label: "GPS NEO-6M", sublabel: "3D fix, 9 sats", status: "active", color: "#00e5ff", value: "1.2m" },
    { label: "FreeRTOS", sublabel: "Dual core", status: "active", color: "#ffd600", value: "99%" },
    { label: "TFT Display", sublabel: "ILI9341 320×240", status: "active", color: "#00e676", value: "60fps" },
  ];

  return (
    <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl p-4">
      <div
        className="text-[11px] text-[#4a4a6a] tracking-[0.2em] mb-3"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        SYSTEM STATUS
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {/* Status dot */}
            <div className="relative shrink-0">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span
                  className="text-[11px] text-[#a0a0c0]"
                  style={{ fontFamily: "'Orbitron', monospace" }}
                >
                  {item.label}
                </span>
                {item.value && (
                  <span
                    className="text-[10px] tabular-nums"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                )}
              </div>
              <div className="text-[9px] text-[#2e2e4e]">{item.sublabel}</div>
            </div>

            <span
              className="text-[8px] px-1.5 py-0.5 rounded border shrink-0"
              style={{
                color: item.color,
                borderColor: `${item.color}30`,
                background: `${item.color}0a`,
                fontFamily: "'Orbitron', monospace",
              }}
            >
              {item.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Overall health */}
      <div
        className={`mt-3 pt-3 border-t border-[#1e1e2e] flex items-center justify-between ${emergency ? "text-[#ff1744]" : "text-[#00e676]"}`}
      >
        <span className="text-[10px]" style={{ fontFamily: "'Orbitron', monospace" }}>
          SYSTEM HEALTH
        </span>
        <span className="text-[10px] font-bold" style={{ fontFamily: "'Orbitron', monospace" }}>
          {emergency ? "⚠ ALERT MODE" : "✓ NOMINAL"}
        </span>
      </div>
    </div>
  );
}
