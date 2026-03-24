import { useEffect, useRef } from "react";

type AudioClass = "emergency" | "human" | "traffic" | "silent";

interface Props {
  audioClass: AudioClass;
  confidence: number;
  blinkOn: boolean;
}

const CLASS_CONFIG: Record<AudioClass, { label: string; color: string; icon: string; desc: string }> = {
  emergency: { label: "EMERGENCY", color: "#ff1744", icon: "🚨", desc: "Siren / klaxon detected" },
  human: { label: "HUMAN VOICE", color: "#ffd600", icon: "🗣", desc: "Speech / shouting detected" },
  traffic: { label: "TRAFFIC", color: "#ff9100", icon: "🚗", desc: "Vehicle / horn detected" },
  silent: { label: "SILENT", color: "#00e676", icon: "🔇", desc: "Ambient / background noise" },
};

const ALL_CLASSES: AudioClass[] = ["emergency", "human", "traffic", "silent"];

export default function AudioClassifier({ audioClass, confidence, blinkOn }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const bars = Array.from({ length: 32 }, () => Math.random());
    const targets = Array.from({ length: 32 }, () => Math.random());

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      bars.forEach((v, i) => {
        targets[i] += (Math.random() - 0.5) * 0.15;
        targets[i] = Math.max(0.05, Math.min(1, targets[i]));
        bars[i] += (targets[i] - bars[i]) * 0.15;

        const intensity =
          audioClass === "emergency" ? bars[i] * 1.3
          : audioClass === "traffic" ? bars[i] * 0.9
          : audioClass === "human" ? bars[i] * 0.7
          : bars[i] * 0.3;

        const bh = Math.max(2, Math.min(H * 0.9, H * intensity));
        const bw = W / 32 - 1;
        const bx = i * (W / 32);
        const by = (H - bh) / 2;

        const cfg = CLASS_CONFIG[audioClass];
        const alpha = audioClass === "emergency" ? 0.9 : 0.65;
        ctx.fillStyle =
          audioClass === "emergency" && frameRef.current % 20 < 10
            ? `rgba(255,100,100,${alpha})`
            : `${cfg.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 1);
        ctx.fill();
      });

      frameRef.current++;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [audioClass]);

  const cfg = CLASS_CONFIG[audioClass];

  return (
    <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] text-[#4a4a6a] tracking-[0.2em]"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          TINYML AUDIO CLASSIFIER — PDM MIC
        </span>
        <span className="text-[10px] text-[#4a4a6a]">Edge Impulse DSP</span>
      </div>

      <div className="flex gap-4 items-center">
        {/* Waveform canvas */}
        <canvas
          ref={canvasRef}
          width={160}
          height={56}
          className="rounded-lg shrink-0"
          style={{ background: "#08081a" }}
        />

        {/* Active class display */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{cfg.icon}</span>
            <span
              className="text-sm font-bold tracking-widest"
              style={{ color: cfg.color, fontFamily: "'Orbitron', monospace", textShadow: `0 0 8px ${cfg.color}60` }}
            >
              {cfg.label}
            </span>
          </div>
          <div className="text-[10px] text-[#4a4a6a] mb-2">{cfg.desc}</div>

          {/* Confidence bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#1a1a28] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${confidence}%`,
                  background: `linear-gradient(to right, ${cfg.color}80, ${cfg.color})`,
                  boxShadow: `0 0 6px ${cfg.color}60`,
                }}
              />
            </div>
            <span
              className="text-[11px] font-bold tabular-nums shrink-0"
              style={{ color: cfg.color, fontFamily: "'Orbitron', monospace" }}
            >
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* All class readouts */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {ALL_CLASSES.map((c) => {
          const ccfg = CLASS_CONFIG[c];
          const isActive = c === audioClass;
          const val = isActive ? confidence : Math.round(Math.random() * 15);
          return (
            <div
              key={c}
              className="rounded-lg px-2 py-1.5 text-center border transition-all"
              style={{
                borderColor: isActive ? `${ccfg.color}50` : "#1e1e2e",
                background: isActive ? `${ccfg.color}12` : "#08081a",
              }}
            >
              <div className="text-sm mb-0.5">{ccfg.icon}</div>
              <div
                className="text-[8px] truncate"
                style={{
                  color: isActive ? ccfg.color : "#3a3a5a",
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                {ccfg.label.split(" ")[0]}
              </div>
              <div
                className="text-[10px] font-bold tabular-nums"
                style={{ color: isActive ? ccfg.color : "#2a2a4a" }}
              >
                {val}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
