interface LogEntry {
  id: number;
  ts: string;
  type: "alert" | "info" | "warn";
  msg: string;
}

interface Props {
  logs: LogEntry[];
}

const TYPE_CONFIG = {
  alert: { color: "#ff1744", bg: "rgba(255,23,68,0.08)", border: "rgba(255,23,68,0.2)", label: "ALERT" },
  warn: { color: "#ff9100", bg: "rgba(255,145,0,0.08)", border: "rgba(255,145,0,0.2)", label: "WARN" },
  info: { color: "#4a4a6a", bg: "transparent", border: "transparent", label: "INFO" },
};

export default function SensorLog({ logs }: Props) {
  return (
    <div className="space-y-4">
      <div
        className="text-[13px] text-[#4a4a6a] tracking-[0.2em]"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        SENSOR EVENT LOG
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {(["alert", "warn", "info"] as const).map((type) => {
          const cfg = TYPE_CONFIG[type];
          const count = logs.filter((l) => l.type === type).length;
          return (
            <div
              key={type}
              className="bg-[#0c0c18] border rounded-xl p-3 text-center"
              style={{ borderColor: cfg.border || "#1e1e2e" }}
            >
              <div className="text-2xl font-bold tabular-nums" style={{ color: cfg.color, fontFamily: "'Orbitron', monospace" }}>
                {count}
              </div>
              <div className="text-[9px] mt-0.5" style={{ color: cfg.color, fontFamily: "'Orbitron', monospace" }}>
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log entries */}
      <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1e1e2e] bg-[#08081a]">
          <span className="text-[9px] text-[#2e2e4e] font-bold w-16" style={{ fontFamily: "'Orbitron', monospace" }}>TIME</span>
          <span className="text-[9px] text-[#2e2e4e] font-bold w-10" style={{ fontFamily: "'Orbitron', monospace" }}>TYPE</span>
          <span className="text-[9px] text-[#2e2e4e] font-bold" style={{ fontFamily: "'Orbitron', monospace" }}>MESSAGE</span>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "480px" }}>
          {logs.length === 0 && (
            <div className="py-12 text-center text-[#2e2e4e] text-sm">
              Waiting for sensor data...
            </div>
          )}
          {logs.map((entry) => {
            const cfg = TYPE_CONFIG[entry.type];
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 px-4 py-2 border-b transition-all"
                style={{
                  borderColor: "#0e0e1e",
                  background: cfg.bg,
                }}
              >
                <span className="text-[10px] text-[#3a3a5a] tabular-nums shrink-0 w-16 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {entry.ts}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded border shrink-0 font-bold w-12 text-center"
                  style={{
                    color: cfg.color,
                    borderColor: cfg.border,
                    background: cfg.bg,
                    fontFamily: "'Orbitron', monospace",
                  }}
                >
                  {cfg.label}
                </span>
                <span className="text-[11px] text-[#6a6a8a] leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {entry.msg}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
