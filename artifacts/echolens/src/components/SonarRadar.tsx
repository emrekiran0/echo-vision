import { useRef, useEffect } from "react";

interface Props {
  leftAlert: boolean;
  rightAlert: boolean;
  leftDist: number;
  rightDist: number;
  emergency: boolean;
  emergencyType?: "ambulance" | "other";
  hornDetected?: boolean;
  tick: number;
}

export default function SonarRadar({ leftAlert, rightAlert, leftDist, rightDist, emergency, emergencyType, hornDetected, tick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepRef = useRef(0);
  const animRef = useRef(0);
  const sysTickRef = useRef(Date.now());
  const ambulanceProgressRef = useRef(0);
  const hornProgressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset approach animation each time ambulance state activates
    if (emergency && emergencyType === "ambulance") {
      ambulanceProgressRef.current = 0;
    }

    // Reset horn approach animation each time horn state activates
    if (hornDetected) {
      hornProgressRef.current = 0;
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

      // ── AMBULANCE REAR ALERT (one-time approach, two side-by-side lights) ───────
      if (isAmbulance) {
        const carH = 36;
        // Resting position: directly behind the car
        const restY = cy + carH / 2 + 32;
        // Start position: outer radar edge (bottom)
        const startY = cy + maxR * 0.93;

        // Advance progress once — clamps at 1 and never moves again
        if (ambulanceProgressRef.current < 1) {
          ambulanceProgressRef.current = Math.min(1, ambulanceProgressRef.current + 1 / 220);
        }
        const t = ambulanceProgressRef.current;
        // Cubic ease-out: arrives fast, decelerates smoothly to rest
        const easedT = 1 - Math.pow(1 - t, 3);
        const dotY = startY + (restY - startY) * easedT;

        // Fixed dot size — no size variation so the two dots stay equal
        const dotR = 6;
        const spacing = dotR + 5; // gap between red and blue centres

        const redX = cx - spacing;
        const blueX = cx + spacing;

        // Independent gentle pulses — offset by π/2 so they breathe alternately
        // Slower frequency (0.05) = no harsh flickering
        const pulseRed  = 0.55 + 0.45 * Math.sin(frame * 0.05);
        const pulseBlue = 0.55 + 0.45 * Math.sin(frame * 0.05 + Math.PI / 2);

        // Motion trail while still approaching
        if (t < 1) {
          const trailSteps = 5;
          for (let i = 1; i <= trailSteps; i++) {
            const tBack = Math.max(0, t - (i / trailSteps) * 0.3);
            const easedBack = 1 - Math.pow(1 - tBack, 3);
            const trailY = startY + (restY - startY) * easedBack;
            const alpha = (1 - i / trailSteps) * 0.2;
            // Red trail
            ctx.beginPath();
            ctx.arc(redX, trailY, dotR * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,30,60,${alpha})`;
            ctx.fill();
            // Blue trail
            ctx.beginPath();
            ctx.arc(blueX, trailY, dotR * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(30,120,255,${alpha})`;
            ctx.fill();
          }
        }

        // Helper: draw one light (core + mid glow + outer halo)
        function drawLight(lx: number, ly: number, r: number, gr: number, gb: number, pulse: number) {
          // Outer halo
          const haloR = 36 + pulse * 10;
          const halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, haloR);
          halo.addColorStop(0, `rgba(${255},${gr},${gb},${0.18 + pulse * 0.12})`);
          halo.addColorStop(0.5, `rgba(${255},${gr},${gb},${0.06 + pulse * 0.04})`);
          halo.addColorStop(1, "transparent");
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(lx, ly, haloR, 0, Math.PI * 2); ctx.fill();

          // Mid bloom
          const midR = 14 + pulse * 5;
          const mid = ctx.createRadialGradient(lx, ly, 0, lx, ly, midR);
          mid.addColorStop(0, `rgba(${255},${gr},${gb},${0.65 + pulse * 0.25})`);
          mid.addColorStop(1, "transparent");
          ctx.fillStyle = mid;
          ctx.beginPath(); ctx.arc(lx, ly, midR, 0, Math.PI * 2); ctx.fill();

          // Core dot — fixed radius, no size pulsing
          ctx.beginPath();
          ctx.arc(lx, ly, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${255},${gr},${gb})`;
          ctx.fill();

          // Specular highlight (top-left of core)
          ctx.beginPath();
          ctx.arc(lx - 1.5, ly - 1.5, r * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.4 + pulse * 0.4})`;
          ctx.fill();
        }

        // Red light  (rgb 255, 23, 68)
        drawLight(redX,  dotY, dotR, 23,  68,  pulseRed);
        // Blue light (rgb 255 is wrong — swap to proper blue: 30, 120, 255)
        // We need a blue helper with full blue channel — handle separately
        // Blue: draw with actual blue
        (() => {
          const lx = blueX;
          const ly = dotY;
          const pulse = pulseBlue;

          const haloR = 36 + pulse * 10;
          const halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, haloR);
          halo.addColorStop(0, `rgba(30,100,255,${0.18 + pulse * 0.12})`);
          halo.addColorStop(0.5, `rgba(30,100,255,${0.06 + pulse * 0.04})`);
          halo.addColorStop(1, "transparent");
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(lx, ly, haloR, 0, Math.PI * 2); ctx.fill();

          const midR = 14 + pulse * 5;
          const mid = ctx.createRadialGradient(lx, ly, 0, lx, ly, midR);
          mid.addColorStop(0, `rgba(30,100,255,${0.65 + pulse * 0.25})`);
          mid.addColorStop(1, "transparent");
          ctx.fillStyle = mid;
          ctx.beginPath(); ctx.arc(lx, ly, midR, 0, Math.PI * 2); ctx.fill();

          ctx.beginPath();
          ctx.arc(lx, ly, dotR, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(30,100,255)`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(lx - 1.5, ly - 1.5, dotR * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.4 + pulse * 0.4})`;
          ctx.fill();
        })();

        // "▲ REAR ALERT" label — fades in during final 50% of approach
        const labelAlpha = Math.min(1, Math.max(0, (easedT - 0.5) * 2));
        ctx.fillStyle = `rgba(255,60,60,${labelAlpha * 0.85})`;
        ctx.font = "bold 8px 'Orbitron', monospace";
        ctx.textAlign = "center";
        ctx.fillText("▲ REAR ALERT", cx, dotY + dotR + 13);
      }

      // ── HORN ALERT (one-time yellow dot approaching from rear) ────────────────
      if (hornDetected) {
        const carH = 36;
        const restY  = cy + carH / 2 + 32;
        const startY = cy + maxR * 0.93;

        // Advance progress once — clamps at 1, never loops
        if (hornProgressRef.current < 1) {
          hornProgressRef.current = Math.min(1, hornProgressRef.current + 1 / 220);
        }
        const t = hornProgressRef.current;
        const easedT = 1 - Math.pow(1 - t, 3);
        const dotY = startY + (restY - startY) * easedT;
        const dotX  = cx;
        const dotR  = 6;

        // Gentle pulse — slow sine, no harsh flickering
        const pulse = 0.55 + 0.45 * Math.sin(frame * 0.05);

        // Motion trail while still approaching
        if (t < 1) {
          const trailSteps = 5;
          for (let i = 1; i <= trailSteps; i++) {
            const tBack    = Math.max(0, t - (i / trailSteps) * 0.3);
            const easedBack = 1 - Math.pow(1 - tBack, 3);
            const trailY   = startY + (restY - startY) * easedBack;
            const alpha    = (1 - i / trailSteps) * 0.22;
            ctx.beginPath();
            ctx.arc(dotX, trailY, dotR * 0.55, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,210,0,${alpha})`;
            ctx.fill();
          }
        }

        // Outer ambient halo
        const haloR = 40 + pulse * 12;
        const halo = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, haloR);
        halo.addColorStop(0,   `rgba(255,210,0,${0.20 + pulse * 0.14})`);
        halo.addColorStop(0.5, `rgba(255,210,0,${0.07 + pulse * 0.05})`);
        halo.addColorStop(1,   "transparent");
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(dotX, dotY, haloR, 0, Math.PI * 2); ctx.fill();

        // Mid bloom
        const midR = 15 + pulse * 5;
        const mid = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, midR);
        mid.addColorStop(0, `rgba(255,210,0,${0.70 + pulse * 0.25})`);
        mid.addColorStop(1, "transparent");
        ctx.fillStyle = mid;
        ctx.beginPath(); ctx.arc(dotX, dotY, midR, 0, Math.PI * 2); ctx.fill();

        // Core dot — fixed radius
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(255,210,0)`;
        ctx.fill();

        // Specular highlight
        ctx.beginPath();
        ctx.arc(dotX - 1.5, dotY - 1.5, dotR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,200,${0.45 + pulse * 0.4})`;
        ctx.fill();

        // "▲ HORN DETECTED" label — fades in during last 50% of approach
        const labelAlpha = Math.min(1, Math.max(0, (easedT - 0.5) * 2));
        ctx.fillStyle = `rgba(255,210,0,${labelAlpha * 0.9})`;
        ctx.font = "bold 8px 'Orbitron', monospace";
        ctx.textAlign = "center";
        ctx.fillText("▲ HORN DETECTED", dotX, dotY + dotR + 13);
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
  }, [leftAlert, rightAlert, leftDist, rightDist, emergency, emergencyType, hornDetected]);

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
              animation: "listenPulse 2.4s ease-in-out infinite",
            }}
          >
            LISTENING FOR CRITICAL SOUNDS
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
