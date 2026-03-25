import { useRef, useEffect } from "react";

export type AudioClassification = "ambulance" | "horn" | "none";

interface Props {
  classification: AudioClassification;
}

const BAR_COUNT = 36;

export default function AudioClassifier({ classification }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef  = useRef(0);
  const smoothed = useRef<number[]>(Array(BAR_COUNT).fill(0.06));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    cancelAnimationFrame(animRef.current);
    let frame = 0;

    function draw() {
      if (!canvas || !ctx) return;
      frame++;

      const W = canvas.width;
      const H = canvas.height;

      // ── Generate target bar heights for this frame ─────────────────────────
      const targets = new Float32Array(BAR_COUNT);

      if (classification === "none") {
        // Calm: slow, low-amplitude overlapping sines
        const t = frame * 0.022;
        for (let i = 0; i < BAR_COUNT; i++) {
          targets[i] =
            0.07 +
            0.055 * Math.sin(t + i * 0.40) +
            0.030 * Math.sin(t * 1.7 + i * 0.75) +
            0.015 * Math.sin(t * 3.1 + i * 1.1);
        }
      } else if (classification === "horn") {
        // Sharp periodic burst — repeats every 70 frames, fast attack/decay
        const period = 70;
        const phase  = (frame % period) / period;
        // Burst envelope: sine arch in first 30% of period, silent rest
        const burst  = phase < 0.30
          ? Math.sin((phase / 0.30) * Math.PI)
          : 0;
        const t = frame * 0.14; // fast oscillation inside the burst
        for (let i = 0; i < BAR_COUNT; i++) {
          const wave = 0.5 + 0.5 * Math.sin(t + i * 0.55);
          // Spike shape: higher in the middle-low bins (horn is mid-freq)
          const shape = Math.max(0, 1 - Math.abs((i / BAR_COUNT) - 0.35) * 2.2);
          targets[i] = 0.05 + burst * (0.60 + 0.35 * wave) * (0.4 + 0.6 * shape);
        }
      } else {
        // Ambulance: continuous high energy, sweeping frequency emphasis
        const sweep = Math.sin(frame * 0.04); // slow freq sweep
        const t     = frame * 0.20;           // fast oscillation
        for (let i = 0; i < BAR_COUNT; i++) {
          // Sweeping spectral peak centred around `centre`
          const centre = 0.35 + 0.30 * sweep;
          const dist   = Math.abs(i / BAR_COUNT - centre);
          const shape  = Math.exp(-dist * dist * 12);
          const wave   = 0.5 + 0.5 * Math.sin(t + i * 0.45);
          targets[i]   = 0.28 + (0.55 * shape + 0.18) * wave;
        }
      }

      // ── Smooth toward targets ──────────────────────────────────────────────
      // Latch: slower decay in ambulance so bars stay visibly high
      const latch = classification === "ambulance" ? 0.72
                  : classification === "horn"       ? 0.55
                  :                                   0.80;
      for (let i = 0; i < BAR_COUNT; i++) {
        smoothed.current[i] = smoothed.current[i] * latch + targets[i] * (1 - latch);
      }

      // ── Derived colours ────────────────────────────────────────────────────
      const isAmbu = classification === "ambulance";
      const isHorn = classification === "horn";
      const pulse  = 0.5 + 0.5 * Math.sin(frame * 0.07);

      // ── Background ─────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#07080f";
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = "rgba(0,229,255,0.03)";
      ctx.lineWidth   = 0.5;
      for (let gx = 0; gx < W; gx += 22) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 22) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Ambient glow when alert active
      if (isAmbu || isHorn) {
        const glowA = 0.09 + pulse * 0.08;
        const grd = ctx.createRadialGradient(W / 2, H, 0, W / 2, H / 2, W * 0.65);
        grd.addColorStop(0, isAmbu ? `rgba(255,23,68,${glowA})` : `rgba(255,210,0,${glowA})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Bars ───────────────────────────────────────────────────────────────
      const padX   = 6;
      const baseY  = H - 6;
      const totalW = W - padX * 2;
      const gap    = 2;
      const barW   = (totalW - gap * (BAR_COUNT - 1)) / BAR_COUNT;
      const maxBarH = H - 14;

      for (let i = 0; i < BAR_COUNT; i++) {
        const barH = Math.max(3, smoothed.current[i] * maxBarH);
        const x    = padX + i * (barW + gap);
        const y    = baseY - barH;

        let topColor: string;
        let botColor: string;

        if (isAmbu) {
          const isBlue = i % 2 === 1;
          const a = 0.55 + smoothed.current[i] * 0.45;
          topColor = isBlue ? `rgba(30,100,255,${a})` : `rgba(255,23,68,${a})`;
          botColor = isBlue ? `rgba(30,100,255,0.10)` : `rgba(255,23,68,0.10)`;
        } else if (isHorn) {
          const a = 0.50 + smoothed.current[i] * 0.50;
          topColor = `rgba(255,210,0,${a})`;
          botColor = `rgba(255,210,0,0.10)`;
        } else {
          const a = 0.28 + smoothed.current[i] * 0.32;
          topColor = `rgba(0,229,255,${a})`;
          botColor = `rgba(0,229,255,0.04)`;
        }

        const grad = ctx.createLinearGradient(x, y, x, baseY);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, botColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [1, 1, 0, 0]);
        ctx.fill();

        // Top cap highlight
        if (smoothed.current[i] > 0.18) {
          ctx.fillStyle = topColor;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, 2, 1);
          ctx.fill();
        }
      }

      // Baseline
      ctx.strokeStyle = "rgba(0,229,255,0.09)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, baseY);
      ctx.lineTo(W - padX, baseY);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [classification]);

  // ── Derived display values ────────────────────────────────────────────────
  const classLabel =
    classification === "ambulance" ? "AMBULANCE DETECTED"
    : classification === "horn"    ? "HORN DETECTED"
    :                                "NO CRITICAL SOUND";

  const classColor =
    classification === "ambulance" ? "#ff1744"
    : classification === "horn"    ? "#ffd600"
    :                                "#2a3a4a";

  const borderColor =
    classification === "ambulance" ? "rgba(255,23,68,0.50)"
    : classification === "horn"    ? "rgba(255,214,0,0.45)"
    :                                "rgba(0,229,255,0.10)";

  const glowShadow =
    classification === "ambulance" ? "0 0 18px rgba(255,23,68,0.22)"
    : classification === "horn"    ? "0 0 18px rgba(255,214,0,0.18)"
    :                                "none";

  return (
    <div
      style={{
        background: "#07080f",
        border: `1px solid ${borderColor}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: glowShadow,
        transition: "border-color 0.5s, box-shadow 0.5s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px 0",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#00e5ff",
              letterSpacing: "0.2em",
              textShadow: "0 0 8px rgba(0,229,255,0.35)",
            }}
          >
            AI AUDIO CLASSIFICATION
          </div>
          <div
            style={{
              fontSize: 7,
              color: "#2a2a40",
              letterSpacing: "0.1em",
              marginTop: 2,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ● AI CLASSIFICATION ACTIVE
          </div>
        </div>

        {/* Signal strength indicator */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          {[0.25, 0.45, 0.65, 0.85, 1.0].map((h, idx) => {
            const lit =
              classification === "ambulance" ? idx <= 4
              : classification === "horn"    ? idx <= 2
              :                                idx <= 1;
            const color =
              classification === "ambulance" ? (idx % 2 === 0 ? "#ff1744" : "#1e6eff")
              : classification === "horn"    ? "#ffd600"
              :                                "#00e5ff";
            return (
              <div
                key={idx}
                style={{
                  width: 4,
                  height: 6 + idx * 3,
                  borderRadius: 1,
                  background: lit ? color : "#1a1a28",
                  boxShadow: lit ? `0 0 4px ${color}` : "none",
                  transition: "background 0.4s, box-shadow 0.4s",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={88}
        style={{ width: "100%", display: "block", marginTop: 8 }}
      />

      {/* Classification result row */}
      <div
        style={{
          margin: "0 10px 10px",
          padding: "10px 14px",
          background: "#0a0a14",
          border: `1px solid ${borderColor}`,
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "border-color 0.5s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: classColor,
              boxShadow: classification !== "none" ? `0 0 8px ${classColor}` : "none",
              animation: classification !== "none" ? "pulse 1s ease-in-out infinite" : "none",
              flexShrink: 0,
              transition: "background 0.4s, box-shadow 0.4s",
            }}
          />
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: classColor,
                letterSpacing: "0.15em",
                textShadow: classification !== "none" ? `0 0 10px ${classColor}70` : "none",
                transition: "color 0.4s, text-shadow 0.4s",
              }}
            >
              {classLabel}
            </div>
            <div style={{ fontSize: 7, color: "#2a2a40", letterSpacing: "0.1em", marginTop: 1 }}>
              AI AUDIO CLASSIFICATION ACTIVE
            </div>
          </div>
        </div>

        {/* Ambulance: paired red + blue dots */}
        {classification === "ambulance" && (
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div
              style={{
                width: 9, height: 9, borderRadius: "50%",
                background: "#ff1744", boxShadow: "0 0 8px #ff1744",
                animation: "pulse 0.55s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: 9, height: 9, borderRadius: "50%",
                background: "#1e6eff", boxShadow: "0 0 8px #1e6eff",
                animation: "pulse 0.55s ease-in-out infinite 0.28s",
              }}
            />
          </div>
        )}

        {/* Horn: single yellow dot */}
        {classification === "horn" && (
          <div
            style={{
              width: 9, height: 9, borderRadius: "50%",
              background: "#ffd600", boxShadow: "0 0 10px #ffd600",
              animation: "pulse 0.8s ease-in-out infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}
