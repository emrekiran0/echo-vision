import { useRef, useEffect } from "react";

interface Props {
  leftAlert: boolean;
  rightAlert: boolean;
  leftDist: number;
  rightDist: number;
  emergency: boolean;
  emergencyType?: "ambulance" | "other";
  tick: number;
}

export default function SonarRadar({ leftAlert, rightAlert, leftDist, rightDist, emergency, emergencyType, tick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepRef = useRef(0);
  const animRef = useRef(0);
  const sysTickRef = useRef(Date.now());
  const ambulanceProgressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset approach animation each time ambulance state activates
    if (emergency && emergencyType === "ambulance") {
      ambulanceProgressRef.current = 0;
    }

    let frame = 0;

    function draw() {
      if (!canvas || !ctx) return;
      frame++;

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

      const isAmbulance = emergency && emergencyType === "ambulance";

      // ── SWEEP LINE (hidden for ambulance mode) ────────────────────────────────
      if (!isAmbulance) {
        sweepRef.current = (sweepRef.current + 0.012) % (Math.PI * 2);
        const sweep = sweepRef.current - Math.PI / 2; // 0 = top
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
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweep) * maxR, cy + Math.sin(sweep) * maxR);
        ctx.strokeStyle = "rgba(0,229,255,0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── BLIPS (hidden for ambulance mode) ─────────────────────────────────────
      function distToR(cm: number): number {
        return Math.min(maxR * 0.95, (cm / 200) * maxR * 0.85);
      }

      if (!isAmbulance) {
        // Left blip
        if (leftAlert) {
          const br = distToR(leftDist);
          const ba = Math.PI;
          const bx = cx + Math.cos(ba) * br;
          const by = cy + Math.sin(ba) * br;
          const blink = Math.sin(frame * 0.2) > 0;

          const blipGlow = ctx.createRadialGradient(bx, by, 0, bx, by, 18);
          blipGlow.addColorStop(0, `rgba(255,23,68,${blink ? 0.7 : 0.3})`);
          blipGlow.addColorStop(1, "transparent");
          ctx.fillStyle = blipGlow;
          ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.fill();

          ctx.beginPath();
          ctx.arc(bx, by, 5, 0, Math.PI * 2);
          ctx.fillStyle = blink ? "#ff1744" : "#ff5252";
          ctx.fill();

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

        // Right blip
        if (rightAlert) {
          const br = distToR(rightDist);
          const ba = 0;
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

        // Multi-blip emergency (non-ambulance)
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
      }

      // ── AMBULANCE REAR ALERT (approaching red/blue flashing light) ────────────
      if (isAmbulance) {
        const carH = 36;
        // Resting position: just behind the car
        const restY = cy + carH / 2 + 30;
        // Start position: near the outer radar edge (bottom)
        const startY = cy + maxR * 0.92;

        // Advance approach progress: 0 → 1 over ~140 frames (ease-out cubic)
        if (ambulanceProgressRef.current < 1) {
          ambulanceProgressRef.current = Math.min(1, ambulanceProgressRef.current + 1 / 140);
        }
        const t = ambulanceProgressRef.current;
        // Cubic ease-out: fast at start, slows to a stop
        const easedT = 1 - Math.pow(1 - t, 3);

        const dotX = cx;
        const dotY = startY + (restY - startY) * easedT;

        // Pulse intensity (independent of approach)
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12);

        // Red / blue alternating flash — switches every 10 frames
        const flashCycle = Math.floor(frame / 10) % 2;
        const isRedPhase = flashCycle === 0;
        const lr = isRedPhase ? 255 : 30;
        const lg = isRedPhase ? 23 : 120;
        const lb = isRedPhase ? 68 : 255;
        // Secondary color (opposite phase, smaller dot beside it)
        const sr = isRedPhase ? 30 : 255;
        const sg = isRedPhase ? 120 : 23;
        const sb = isRedPhase ? 255 : 68;

        // Motion trail — fading dots leading from where it came
        if (t < 1) {
          const trailSteps = 6;
          for (let i = 1; i <= trailSteps; i++) {
            const tBack = Math.max(0, t - (i / trailSteps) * 0.35);
            const easedBack = 1 - Math.pow(1 - tBack, 3);
            const trailY = startY + (restY - startY) * easedBack;
            const trailAlpha = (1 - i / trailSteps) * 0.25;
            ctx.beginPath();
            ctx.arc(dotX, trailY, 4 - i * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,80,80,${trailAlpha})`;
            ctx.fill();
          }
        }

        // Outer ambient halo — blends both colors
        const haloR = 48 + pulse * 16;
        const halo = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, haloR);
        halo.addColorStop(0, `rgba(${lr},${lg},${lb},${0.28 + pulse * 0.16})`);
        halo.addColorStop(0.5, `rgba(${lr},${lg},${lb},${0.08 + pulse * 0.06})`);
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(dotX, dotY, haloR, 0, Math.PI * 2); ctx.fill();

        // Mid glow
        const midR = 20 + pulse * 7;
        const mid = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, midR);
        mid.addColorStop(0, `rgba(${lr},${lg},${lb},${0.7 + pulse * 0.3})`);
        mid.addColorStop(1, "transparent");
        ctx.fillStyle = mid;
        ctx.beginPath(); ctx.arc(dotX, dotY, midR, 0, Math.PI * 2); ctx.fill();

        // Core dot — main color
        const coreR = 6 + pulse * 2.5;
        ctx.beginPath();
        ctx.arc(dotX, dotY, coreR, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${lr},${lg},${lb})`;
        ctx.fill();

        // Bright inner highlight
        ctx.beginPath();
        ctx.arc(dotX - 1, dotY - 1.5, coreR * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.45 + pulse * 0.45})`;
        ctx.fill();

        // Small secondary-color accent dot (offset slightly)
        const accentR = 3 + pulse * 1.5;
        ctx.beginPath();
        ctx.arc(dotX + coreR + accentR + 1, dotY, accentR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sr},${sg},${sb},${0.6 + pulse * 0.4})`;
        ctx.fill();
        // Accent glow
        const accentGlow = ctx.createRadialGradient(
          dotX + coreR + accentR + 1, dotY, 0,
          dotX + coreR + accentR + 1, dotY, accentR + 8
        );
        accentGlow.addColorStop(0, `rgba(${sr},${sg},${sb},${0.35 + pulse * 0.2})`);
        accentGlow.addColorStop(1, "transparent");
        ctx.fillStyle = accentGlow;
        ctx.beginPath();
        ctx.arc(dotX + coreR + accentR + 1, dotY, accentR + 8, 0, Math.PI * 2);
        ctx.fill();

        // "▲ REAR ALERT" label — fades in as the dot approaches
        const labelAlpha = Math.min(1, easedT * 2);
        ctx.fillStyle = `rgba(${lr},${lg},${lb},${labelAlpha * (0.6 + pulse * 0.4)})`;
        ctx.font = "bold 8px 'Orbitron', monospace";
        ctx.textAlign = "center";
        ctx.fillText("▲ REAR ALERT", dotX, dotY + coreR + 14);
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
  }, [leftAlert, rightAlert, leftDist, rightDist, emergency, emergencyType]);

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
