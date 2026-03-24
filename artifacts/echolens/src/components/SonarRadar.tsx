import { useRef, useEffect } from "react";

interface Props {
  leftAlert: boolean;
  rightAlert: boolean;
  leftDist: number;
  rightDist: number;
  emergency: boolean;
  tick: number;
}

export default function SonarRadar({ leftAlert, rightAlert, leftDist, rightDist, emergency, tick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepRef = useRef(0);
  const animRef = useRef(0);
  const sysTickRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;

    function draw() {
      if (!canvas || !ctx) return;
      frame++;
      sweepRef.current = (sweepRef.current + 0.012) % (Math.PI * 2);

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2 + 10;
      const maxR = Math.min(W, H) * 0.42;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#07080f";
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = "rgba(0,229,255,0.04)";
      ctx.lineWidth = 0.5;
      const gs = 28;
      for (let gx = 0; gx < W; gx += gs) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += gs) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // ── DETECTION CONE (forward arc, amber/orange) ──────────────────────────
      // Forward means "upward" in our view (0° = top = -π/2 in canvas)
      const coneAngle = Math.PI * 0.55; // ~99° spread
      const coneStart = -Math.PI / 2 - coneAngle / 2;
      const coneEnd = -Math.PI / 2 + coneAngle / 2;

      // Outer glow of cone
      const coneGrad = ctx.createConicalGradient
        ? null
        : null;

      // Painted as a sector with gradient fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR * 1.02, coneStart, coneEnd);
      ctx.closePath();
      const coneRadial = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      coneRadial.addColorStop(0, "rgba(255,140,0,0.25)");
      coneRadial.addColorStop(0.5, "rgba(255,120,0,0.12)");
      coneRadial.addColorStop(1, "rgba(255,90,0,0.04)");
      ctx.fillStyle = coneRadial;
      ctx.fill();
      ctx.restore();

      // ── RANGE RINGS ────────────────────────────────────────────────────────
      const rings = [
        { r: maxR * 0.33, label: "[10m]" },
        { r: maxR * 0.66, label: "[20m]" },
        { r: maxR, label: "[30m]" },
      ];

      rings.forEach(({ r, label }) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,229,255,0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label at top
        ctx.fillStyle = "rgba(0,229,255,0.45)";
        ctx.font = "9px 'Orbitron', monospace";
        ctx.textAlign = "center";
        ctx.fillText(label, cx, cy - r + 12);
      });

      // Cross-hair lines
      ctx.strokeStyle = "rgba(0,229,255,0.10)";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(cx, cy - maxR * 1.05); ctx.lineTo(cx, cy + maxR * 1.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - maxR * 1.05, cy); ctx.lineTo(cx + maxR * 1.05, cy); ctx.stroke();
      ctx.setLineDash([]);

      // ── DEGREE LABELS ────────────────────────────────────────────────────────
      const degPad = 16;
      ctx.fillStyle = "rgba(0,229,255,0.35)";
      ctx.font = "8px 'Orbitron', monospace";
      ctx.textAlign = "center";
      ctx.fillText("0°", cx, cy - maxR - degPad + 10);
      ctx.textAlign = "left";
      ctx.fillText("90°—", cx + maxR + 2, cy + 3);
      ctx.textAlign = "center";
      ctx.fillText("180°", cx, cy + maxR + degPad - 4);
      ctx.textAlign = "right";
      ctx.fillText("—270°", cx - maxR - 2, cy + 3);

      // ── SWEEP LINE ────────────────────────────────────────────────────────────
      const sweep = sweepRef.current - Math.PI / 2; // 0 = top
      // Trailing sweep glow
      for (let i = 0; i < 40; i++) {
        const a = sweep - (i / 40) * (Math.PI * 0.6);
        const alpha = (1 - i / 40) * 0.18;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, a, a + 0.04);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,229,255,${alpha})`;
        ctx.fill();
      }
      // Main sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * maxR, cy + Math.sin(sweep) * maxR);
      ctx.strokeStyle = "rgba(0,229,255,0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── BLIPS ─────────────────────────────────────────────────────────────────
      // Convert cm → meters → radar pixels
      // 200cm = 2m → very close; radar max = 30m
      // But sensor values are in cm (5–200 range), so scale to 0–200cm = 0–30m (scaled)
      // We map: 5cm → near center, 200cm → 2/3 of outer ring
      function distToR(cm: number): number {
        // Map 0–200cm to 0–maxR * 0.7
        return Math.min(maxR * 0.95, (cm / 200) * maxR * 0.85);
      }

      // Left blip: angle ~270° (left side of car = π in canvas terms since 0=right)
      if (leftAlert) {
        const br = distToR(leftDist);
        const ba = Math.PI; // left = 180° in canvas (since 270° in radar = left)
        const bx = cx + Math.cos(ba) * br;
        const by = cy + Math.sin(ba) * br;
        const blink = Math.sin(frame * 0.2) > 0;

        // Glow
        const blipGlow = ctx.createRadialGradient(bx, by, 0, bx, by, 18);
        blipGlow.addColorStop(0, `rgba(255,23,68,${blink ? 0.7 : 0.3})`);
        blipGlow.addColorStop(1, "transparent");
        ctx.fillStyle = blipGlow;
        ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = blink ? "#ff1744" : "#ff5252";
        ctx.fill();

        // Tooltip
        const ttW = 110;
        const ttH = 32;
        const ttX = bx + 10;
        const ttY = by - ttH / 2;
        ctx.fillStyle = "rgba(20,14,0,0.9)";
        ctx.strokeStyle = "#ff9100";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(ttX, ttY, ttW, ttH, 4);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 8px 'Orbitron', monospace";
        ctx.textAlign = "left";
        ctx.fillText("[ LEFT OBJECT ]", ttX + 6, ttY + 11);
        ctx.fillStyle = "#ff9100";
        ctx.font = "8px 'Orbitron', monospace";
        ctx.fillText(`DIST: ${leftDist}cm`, ttX + 6, ttY + 23);
      }

      // Right blip: angle ~0° (right side of car in radar = 0° in canvas)
      if (rightAlert) {
        const br = distToR(rightDist);
        const ba = 0; // right
        const bx = cx + Math.cos(ba) * br;
        const by = cy + Math.sin(ba) * br;
        const blink = Math.sin(frame * 0.2 + 1) > 0;

        const blipGlow = ctx.createRadialGradient(bx, by, 0, bx, by, 18);
        blipGlow.addColorStop(0, `rgba(255,23,68,${blink ? 0.7 : 0.3})`);
        blipGlow.addColorStop(1, "transparent");
        ctx.fillStyle = blipGlow;
        ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = blink ? "#ff1744" : "#ff5252";
        ctx.fill();

        // Tooltip — shift left if near right edge
        const ttW = 115;
        const ttH = 32;
        const ttX = bx - ttW - 10;
        const ttY = by - ttH / 2;
        ctx.fillStyle = "rgba(20,14,0,0.9)";
        ctx.strokeStyle = "#ff9100";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(ttX, ttY, ttW, ttH, 4);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 8px 'Orbitron', monospace";
        ctx.textAlign = "left";
        ctx.fillText("[ RIGHT OBJECT ]", ttX + 6, ttY + 11);
        ctx.fillStyle = "#ff9100";
        ctx.font = "8px 'Orbitron', monospace";
        ctx.fillText(`DIST: ${rightDist}cm`, ttX + 6, ttY + 23);
      }

      // Emergency blip: multiple blips around
      if (emergency) {
        const blinkE = Math.sin(frame * 0.25) > 0;
        [0, 0.8, 1.8, 2.8, 4.2, 5.0].forEach((angle, i) => {
          const er = maxR * (0.15 + i * 0.06);
          const ex = cx + Math.cos(angle) * er;
          const ey = cy + Math.sin(angle) * er;
          const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 14);
          eg.addColorStop(0, `rgba(255,23,68,${blinkE ? 0.9 : 0.3})`);
          eg.addColorStop(1, "transparent");
          ctx.fillStyle = eg;
          ctx.beginPath(); ctx.arc(ex, ey, 14, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fillStyle = blinkE ? "#ff1744" : "#880000";
          ctx.fill();
        });
      }

      // ── EGO CAR (top-down) ─────────────────────────────────────────────────
      const carW = 22;
      const carH = 36;
      const carX = cx - carW / 2;
      const carY = cy - carH / 2;

      // Car body
      ctx.fillStyle = "#1a6080";
      ctx.beginPath();
      ctx.roundRect(carX, carY, carW, carH, [6, 6, 4, 4]);
      ctx.fill();

      // Body highlight
      const carHL = ctx.createLinearGradient(carX, carY, carX + carW, carY);
      carHL.addColorStop(0, "rgba(255,255,255,0.15)");
      carHL.addColorStop(1, "rgba(0,0,0,0.1)");
      ctx.fillStyle = carHL;
      ctx.beginPath();
      ctx.roundRect(carX, carY, carW, carH, [6, 6, 4, 4]);
      ctx.fill();

      // Windshield
      ctx.fillStyle = "rgba(100,210,255,0.35)";
      ctx.beginPath();
      ctx.roundRect(carX + 3, carY + 3, carW - 6, 10, 2);
      ctx.fill();

      // Headlights (front)
      [carX + 2, carX + carW - 6].forEach((lx) => {
        const lg = ctx.createRadialGradient(lx + 2, carY, 0, lx + 2, carY, 10);
        lg.addColorStop(0, "rgba(255,240,180,0.6)");
        lg.addColorStop(1, "transparent");
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(lx + 2, carY, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffe066";
        ctx.beginPath(); ctx.roundRect(lx, carY - 1, 4, 4, 1); ctx.fill();
      });

      // Tail lights (bottom)
      [carX + 1, carX + carW - 5].forEach((lx) => {
        ctx.fillStyle = "rgba(255,50,50,0.9)";
        ctx.beginPath(); ctx.roundRect(lx, carY + carH - 4, 4, 4, 1); ctx.fill();
      });

      // ── SONAR HEADER INFO ─────────────────────────────────────────────────
      // Already rendered in JSX; skip here

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [leftAlert, rightAlert, leftDist, rightDist, emergency]);

  return (
    <div
      style={{
        background: "#07080f",
        border: "1px solid #14141e",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px 0",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#00e5ff",
              letterSpacing: "0.2em",
              textShadow: "0 0 10px rgba(0,229,255,0.5)",
            }}
          >
            SONAR ARRAY ACTIVE
          </div>
          <div
            style={{
              fontSize: 8,
              color: "#3a3a5a",
              letterSpacing: "0.1em",
              marginTop: 2,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            SYS.TICK: {Date.now()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00e676",
              boxShadow: "0 0 6px #00e676",
              animation: "pulse 1s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 8, color: "#00e676", letterSpacing: "0.15em" }}>
            HC-SR04 ×2
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={420}
        height={360}
        style={{ width: "100%", display: "block" }}
      />
    </div>
  );
}
