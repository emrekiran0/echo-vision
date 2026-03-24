interface BoxProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  detail?: string;
}

function ArchBox({ icon, title, subtitle, color, detail }: BoxProps) {
  return (
    <div
      className="rounded-xl border p-3 text-center min-w-[100px] flex-1"
      style={{
        borderColor: `${color}40`,
        background: `${color}0a`,
      }}
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-[10px] font-bold" style={{ color, fontFamily: "'Orbitron', monospace" }}>
        {title}
      </div>
      <div className="text-[8px] text-[#3a3a5a] mt-0.5">{subtitle}</div>
      {detail && (
        <div className="text-[8px] mt-1 px-1.5 py-0.5 rounded" style={{ color: `${color}90`, background: `${color}10` }}>
          {detail}
        </div>
      )}
    </div>
  );
}

function Arrow({ label, color = "#4a4a6a" }: { label: string; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-2 px-1">
      <div className="w-px h-6 mb-1" style={{ background: `linear-gradient(to bottom, transparent, ${color})` }} />
      <div className="text-[8px] text-center whitespace-nowrap" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color }}>▼</div>
    </div>
  );
}

function HArrow({ label, color = "#4a4a6a" }: { label: string; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 shrink-0">
      <div className="h-px w-8 mb-1" style={{ background: color }} />
      <div className="text-[7px] whitespace-nowrap" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </div>
      <div className="text-[10px]" style={{ color }}>▶</div>
    </div>
  );
}

export default function ArchitectureDiagram() {
  return (
    <div className="space-y-4">
      <div
        className="text-[13px] text-[#4a4a6a] tracking-[0.2em]"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        SYSTEM ARCHITECTURE
      </div>

      {/* KART 1 */}
      <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl p-5">
        <div
          className="text-[11px] font-bold mb-4 flex items-center gap-2"
          style={{ color: "#ffab00", fontFamily: "'Orbitron', monospace" }}
        >
          <span className="text-[#ffab00]">◈</span> KART 1 — SENSOR UNIT
          <span className="ml-auto text-[9px] px-2 py-0.5 rounded border border-[#ffab0040] bg-[#ffab000a] text-[#ffab00]">ESP32-WROOM</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <ArchBox icon="🎤" title="PDM MIC" subtitle="TinyML Audio" color="#00e5ff" detail="Edge Impulse" />
          <ArchBox icon="📡" title="ULTRASONIC" subtitle="L + R sensors" color="#00e676" detail="HC-SR04" />
          <ArchBox icon="🛰" title="GPS" subtitle="NEO-6M" color="#ff9100" detail="UART @ 9600" />
          <ArchBox icon="🔊" title="BUZZER" subtitle="Haptic alert" color="#ffd600" detail="PWM 2kHz" />
          <ArchBox icon="🧠" title="ESP32 MCU" subtitle="Dual-core 240MHz" color="#b388ff" detail="FreeRTOS" />
        </div>

        <div className="mt-4 bg-[#08081a] rounded-lg p-3 border border-[#1e1e2e]">
          <div
            className="text-[9px] text-[#3a3a5a] mb-2 tracking-widest"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            TINYML INFERENCE PIPELINE
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {[
              { label: "PDM Input", color: "#00e5ff" },
              { label: "→", color: "#2a2a4a" },
              { label: "MFCC DSP", color: "#b388ff" },
              { label: "→", color: "#2a2a4a" },
              { label: "NN Classifier", color: "#b388ff" },
              { label: "→", color: "#2a2a4a" },
              { label: "4 Classes", color: "#ffd600" },
            ].map((item, i) => (
              <span
                key={i}
                className="text-[10px]"
                style={{ color: item.color, fontFamily: item.label === "→" ? "sans-serif" : "'JetBrains Mono', monospace" }}
              >
                {item.label}
              </span>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            {[
              { icon: "🚨", label: "emergency", color: "#ff1744" },
              { icon: "🗣", label: "human", color: "#ffd600" },
              { icon: "🚗", label: "traffic", color: "#ff9100" },
              { icon: "🔇", label: "silent", color: "#4a4a6a" },
            ].map((c) => (
              <span
                key={c.label}
                className="text-[10px] px-2 py-0.5 rounded border"
                style={{ color: c.color, borderColor: `${c.color}30`, background: `${c.color}10` }}
              >
                {c.icon} {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ESP-NOW arrow */}
      <div className="flex items-center gap-3 px-4">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #ffab00)" }} />
        <div
          className="text-[11px] px-3 py-1.5 rounded-lg border border-[#ffab0040] bg-[#ffab000a]"
          style={{ color: "#ffab00", fontFamily: "'Orbitron', monospace" }}
        >
          ── ESP-NOW 2.4GHz ──▶ &lt;5ms latency
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, #ffab00)" }} />
      </div>

      {/* KART 2 */}
      <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl p-5">
        <div
          className="text-[11px] font-bold mb-4 flex items-center gap-2"
          style={{ color: "#00e5ff", fontFamily: "'Orbitron', monospace" }}
        >
          <span>◈</span> KART 2 — DISPLAY UNIT
          <span className="ml-auto text-[9px] px-2 py-0.5 rounded border border-[#00e5ff40] bg-[#00e5ff0a] text-[#00e5ff]">ESP32-WROOM</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <ArchBox icon="🖥" title="TFT DISPLAY" subtitle="ILI9341 SPI" color="#ff9100" detail="320×240 px" />
          <ArchBox icon="📶" title="WIFI" subtitle="ThingSpeak IoT" color="#00e676" detail="HTTP/REST" />
          <ArchBox icon="⚡" title="FREERTOS" subtitle="Task scheduler" color="#00e5ff" detail="Core 0+1" />
          <ArchBox icon="🔔" title="ALERTS" subtitle="Visual + buzzer" color="#ffd600" detail="PWM" />
        </div>

        <div className="mt-4 bg-[#08081a] rounded-lg p-3 border border-[#1e1e2e]">
          <div
            className="text-[9px] text-[#3a3a5a] mb-2 tracking-widest"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            FREERTOS TASK MAP
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { task: "sensorTask", core: "Core 0", priority: "P3", desc: "Ultrasonic + GPS poll" },
              { task: "displayTask", core: "Core 1", priority: "P2", desc: "TFT render @ 60fps" },
              { task: "wifiTask", core: "Core 0", priority: "P1", desc: "ThingSpeak HTTP POST" },
              { task: "audioTask", core: "Core 1", priority: "P3", desc: "PDM + ML inference" },
            ].map((t) => (
              <div key={t.task} className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] mt-1 shrink-0" />
                <div>
                  <span className="text-[9px] text-[#00e5ff]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.task}</span>
                  <span className="text-[9px] text-[#3a3a5a]"> ({t.core}, {t.priority})</span>
                  <div className="text-[8px] text-[#2a2a4a]">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WiFi arrow */}
      <div className="flex items-center gap-3 px-4">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #00e676)" }} />
        <div
          className="text-[11px] px-3 py-1.5 rounded-lg border border-[#00e67640] bg-[#00e6760a]"
          style={{ color: "#00e676", fontFamily: "'Orbitron', monospace" }}
        >
          ── WiFi / HTTP POST ──▶ 15s interval
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, #00e676)" }} />
      </div>

      {/* ThingSpeak Cloud */}
      <div className="bg-[#0c0c18] border border-[#00e67640] rounded-xl p-5">
        <div
          className="text-[11px] font-bold mb-3 flex items-center gap-2"
          style={{ color: "#00e676", fontFamily: "'Orbitron', monospace" }}
        >
          ☁ THINGSPEAK CLOUD — IoT ANALYTICS
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <ArchBox icon="📊" title="CHANNELS" subtitle="Field 1-8 data" color="#00e676" detail="CSV export" />
          <ArchBox icon="📈" title="ANALYTICS" subtitle="MATLAB scripts" color="#00e5ff" detail="Realtime viz" />
          <ArchBox icon="🔔" title="ALERTS" subtitle="ThingHTTP" color="#ffd600" detail="IFTTT hooks" />
          <ArchBox icon="🗄" title="STORAGE" subtitle="Data retention" color="#b388ff" detail="3M points" />
        </div>
      </div>

      {/* Bill of Materials */}
      <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl p-5">
        <div
          className="text-[11px] font-bold mb-3"
          style={{ color: "#4a4a6a", fontFamily: "'Orbitron', monospace" }}
        >
          BILL OF MATERIALS
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {[
            ["2×", "ESP32-WROOM-32D", "#a0a0c0"],
            ["2×", "HC-SR04 Ultrasonic", "#a0a0c0"],
            ["1×", "NEO-6M GPS Module", "#a0a0c0"],
            ["1×", "ILI9341 TFT 320×240", "#a0a0c0"],
            ["1×", "PDM MEMS Microphone", "#a0a0c0"],
            ["2×", "Piezo Buzzer", "#a0a0c0"],
            ["1×", "LiPo Battery Pack", "#a0a0c0"],
            ["—", "Edge Impulse TinyML", "#00e5ff"],
            ["—", "FreeRTOS", "#b388ff"],
            ["—", "ThingSpeak IoT", "#00e676"],
          ].map(([qty, name, color]) => (
            <div key={name} className="flex gap-2 py-0.5 border-b border-[#0e0e1e] items-center">
              <span className="text-[10px] w-4 shrink-0" style={{ color: "#4a4a6a", fontFamily: "'Orbitron', monospace" }}>{qty}</span>
              <span className="text-[10px]" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
