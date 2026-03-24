import { useRef, useEffect } from "react";

interface Props {
  leftAlert: boolean;
  rightAlert: boolean;
  emergency: boolean;
  blinkOn: boolean;
  tick: number;
}

export default function RealisticRoad({ leftAlert, rightAlert, emergency, blinkOn, tick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let dashOffset = 0;

    function drawFrame() {
      if (!canvas || !ctx) return;
      frame++;
      dashOffset = (dashOffset + 1.4) % 80;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ─── SKY / NIGHT ────────────────────────────────────────────────────────
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.42);
      skyGrad.addColorStop(0, "#04040c");
      skyGrad.addColorStop(0.6, "#080818");
      skyGrad.addColorStop(1, "#101028");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.42);

      // Stars
      const stars = [
        [60, 28, 0.5], [120, 14, 0.7], [200, 35, 0.4], [280, 20, 0.8],
        [350, 40, 0.5], [430, 16, 0.6], [500, 30, 0.4], [560, 10, 0.9],
        [620, 38, 0.5], [700, 22, 0.7], [760, 8, 0.4], [820, 32, 0.6],
        [880, 18, 0.5], [150, 52, 0.3], [460, 55, 0.4], [740, 48, 0.3],
      ];
      stars.forEach(([sx, sy, base]) => {
        const t = Math.sin(frame * 0.04 + sx * 0.02) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${base * 0.5 + t * base * 0.5})`;
        ctx.fill();
      });

      // Distant city glow on horizon
      const cityGlow = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.55);
      cityGlow.addColorStop(0, "rgba(30,50,120,0.35)");
      cityGlow.addColorStop(0.5, "rgba(10,20,60,0.12)");
      cityGlow.addColorStop(1, "transparent");
      ctx.fillStyle = cityGlow;
      ctx.fillRect(0, 0, W, H * 0.5);

      // Moon
      ctx.beginPath();
      ctx.arc(W * 0.82, H * 0.12, 18, 0, Math.PI * 2);
      const moonGrad = ctx.createRadialGradient(W * 0.82, H * 0.12, 0, W * 0.82, H * 0.12, 18);
      moonGrad.addColorStop(0, "#f0f0e0");
      moonGrad.addColorStop(0.7, "#d4d4b8");
      moonGrad.addColorStop(1, "transparent");
      ctx.fillStyle = moonGrad;
      ctx.fill();
      // Moon halo
      const moonHalo = ctx.createRadialGradient(W * 0.82, H * 0.12, 18, W * 0.82, H * 0.12, 50);
      moonHalo.addColorStop(0, "rgba(240,240,200,0.1)");
      moonHalo.addColorStop(1, "transparent");
      ctx.fillStyle = moonHalo;
      ctx.beginPath();
      ctx.arc(W * 0.82, H * 0.12, 50, 0, Math.PI * 2);
      ctx.fill();

      // ─── HORIZON / TREELINE ────────────────────────────────────────────────
      const horizonY = H * 0.415;
      // Silhouette treeline
      ctx.fillStyle = "#06060e";
      for (let tx = 0; tx < W; tx += 22) {
        const th = 18 + Math.sin(tx * 0.15) * 10 + Math.sin(tx * 0.07) * 8;
        ctx.beginPath();
        ctx.moveTo(tx, horizonY);
        ctx.lineTo(tx + 11, horizonY - th);
        ctx.lineTo(tx + 22, horizonY);
        ctx.closePath();
        ctx.fill();
      }
      // Ground fade
      const groundFade = ctx.createLinearGradient(0, horizonY - 4, 0, horizonY + 10);
      groundFade.addColorStop(0, "#08080e");
      groundFade.addColorStop(1, "#0e0e1a");
      ctx.fillStyle = groundFade;
      ctx.fillRect(0, horizonY, W, 12);

      // ─── ROAD SURFACE ──────────────────────────────────────────────────────
      const vx = W * 0.5;
      const yHorizon = horizonY + 8;
      const halfWTop = 36;
      const halfWBot = W * 0.56;

      // Asphalt gradient — darker near horizon, slightly lighter + more textured near viewer
      const asphaltGrad = ctx.createLinearGradient(0, yHorizon, 0, H);
      asphaltGrad.addColorStop(0, "#1a1a1e");
      asphaltGrad.addColorStop(0.15, "#202028");
      asphaltGrad.addColorStop(0.5, "#252530");
      asphaltGrad.addColorStop(0.85, "#1e1e28");
      asphaltGrad.addColorStop(1, "#18181e");
      ctx.fillStyle = asphaltGrad;
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx + halfWTop, yHorizon);
      ctx.lineTo(vx + halfWBot, H);
      ctx.lineTo(vx - halfWBot, H);
      ctx.closePath();
      ctx.fill();

      // Asphalt texture / grain — subtle noise via diagonal lines
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx + halfWTop, yHorizon);
      ctx.lineTo(vx + halfWBot, H);
      ctx.lineTo(vx - halfWBot, H);
      ctx.closePath();
      ctx.clip();

      ctx.globalAlpha = 0.025;
      for (let i = 0; i < 80; i++) {
        const x = (i * 29 + 7) % W;
        ctx.strokeStyle = i % 2 === 0 ? "#ffffff" : "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yHorizon);
        ctx.lineTo(x + 30, H);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ─── HEADLIGHT ILLUMINATION CONES ──────────────────────────────────────
      // Two cone beams from the car (bottom center)
      const beamY0 = H;
      const beamYEnd = yHorizon + (H - yHorizon) * 0.08;
      [vx - 40, vx + 40].forEach((bx, side) => {
        const endX = vx + (side === 0 ? -18 : 18);
        const beamGrad = ctx.createLinearGradient(bx, beamY0, endX, beamYEnd);
        beamGrad.addColorStop(0, "rgba(220,220,190,0.08)");
        beamGrad.addColorStop(0.4, "rgba(200,200,170,0.05)");
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(bx - 30, beamY0);
        ctx.lineTo(bx + 30, beamY0);
        ctx.lineTo(endX + 60, beamYEnd);
        ctx.lineTo(endX - 60, beamYEnd);
        ctx.closePath();
        ctx.fill();
      });

      // Road surface lit by headlights — cone of warm light
      const headlightPool = ctx.createRadialGradient(vx, H, 10, vx, H * 0.72, H * 0.52);
      headlightPool.addColorStop(0, "rgba(200,190,160,0.11)");
      headlightPool.addColorStop(0.4, "rgba(180,170,140,0.06)");
      headlightPool.addColorStop(1, "transparent");
      ctx.fillStyle = headlightPool;
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx + halfWTop, yHorizon);
      ctx.lineTo(vx + halfWBot, H);
      ctx.lineTo(vx - halfWBot, H);
      ctx.closePath();
      ctx.fill();

      // ─── ROAD SHOULDERS ───────────────────────────────────────────────────
      // Narrow gravel/grass shoulders flanking the road
      // Left shoulder
      const shoulderLGrad = ctx.createLinearGradient(0, yHorizon, 0, H);
      shoulderLGrad.addColorStop(0, "#0c0c10");
      shoulderLGrad.addColorStop(1, "#141418");
      ctx.fillStyle = shoulderLGrad;
      ctx.beginPath();
      ctx.moveTo(0, yHorizon);
      ctx.lineTo(vx - halfWTop - 2, yHorizon);
      ctx.lineTo(vx - halfWBot - 2, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Right shoulder
      ctx.fillStyle = shoulderLGrad;
      ctx.beginPath();
      ctx.moveTo(W, yHorizon);
      ctx.lineTo(vx + halfWTop + 2, yHorizon);
      ctx.lineTo(vx + halfWBot + 2, H);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // ─── WHITE EDGE LINES ──────────────────────────────────────────────────
      const edgeAlpha = (frac: number) => `rgba(255,255,255,${0.55 + frac * 0.2})`;
      const steps = 60;
      for (let i = 0; i < steps; i++) {
        const f0 = i / steps;
        const f1 = (i + 1) / steps;
        const lx0 = vx - halfWTop + (vx - halfWBot - (vx - halfWTop)) * f0 - halfWTop * 0.02;
        const lx1 = vx - halfWTop + (vx - halfWBot - (vx - halfWTop)) * f1 - halfWTop * 0.02;
        const rx0 = vx + halfWTop + (vx + halfWBot - (vx + halfWTop)) * f0 + halfWTop * 0.02;
        const rx1 = vx + halfWTop + (vx + halfWBot - (vx + halfWTop)) * f1 + halfWTop * 0.02;
        const y0 = yHorizon + (H - yHorizon) * f0;
        const y1 = yHorizon + (H - yHorizon) * f1;
        const lw = Math.max(1, (0.5 + f0 * 2.5));
        ctx.strokeStyle = edgeAlpha(f0);
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(lx0, y0);
        ctx.lineTo(lx1, y1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx0, y0);
        ctx.lineTo(rx1, y1);
        ctx.stroke();
      }

      // ─── LANE LINES (animated dashes) ──────────────────────────────────────
      // We paint 3 lane lines: left lane, center, right lane
      const laneFracs = [-0.33, 0, 0.33]; // offset from center axis
      laneFracs.forEach((lf) => {
        // Each vertical position maps to a lane-line x
        for (let i = 0; i < steps; i++) {
          const f0 = i / steps;
          const f1 = (i + 1) / steps;
          const halfW0 = halfWTop + (halfWBot - halfWTop) * f0;
          const halfW1 = halfWTop + (halfWBot - halfWTop) * f1;
          const lx0 = vx + lf * halfW0 * 0.65;
          const lx1 = vx + lf * halfW1 * 0.65;
          const y0 = yHorizon + (H - yHorizon) * f0;
          const y1 = yHorizon + (H - yHorizon) * f1;

          // Perspective-scaled dash pattern
          const totalLen = H - yHorizon;
          const distFromVP = f0 * totalLen;
          const dashPeriod = 70;
          const dashLen = 38;
          const phase = (distFromVP - dashOffset * (lf === 0 ? 1.5 : 1.0)) % dashPeriod;
          if (phase >= 0 && phase < dashLen) {
            const lw = Math.max(0.6, f0 * (lf === 0 ? 2.0 : 1.5));
            const alpha = lf === 0 ? 0.8 : 0.55;
            ctx.strokeStyle = lf === 0
              ? `rgba(255,255,255,${alpha * (0.5 + f0 * 0.5)})`
              : `rgba(255,255,255,${alpha * (0.3 + f0 * 0.6)})`;
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(lx0, y0);
            ctx.lineTo(lx1, y1);
            ctx.stroke();
          }
        }
      });

      // ─── ONCOMING HEADLIGHTS (distant) ─────────────────────────────────────
      // Two sets approaching from the distance
      for (let v = 0; v < 2; v++) {
        const cycleLen = 160;
        const basePhase = v * 80;
        const p = ((frame * 0.7 + basePhase) % cycleLen) / cycleLen;
        if (p > 0.6) continue; // only show when "approaching"
        const fy = p; // 0=far, 0.6=close
        const halfWF = halfWTop + (halfWBot - halfWTop) * fy * 0.5;
        const cy = yHorizon + (H - yHorizon) * fy * 0.55;
        const cx = vx - halfWF * 0.28;
        const size = 1.5 + fy * 8;
        const alpha = fy * 0.7 + 0.1;

        // Left headlight
        const hgL = ctx.createRadialGradient(cx - size, cy, 0, cx - size, cy, size * 5);
        hgL.addColorStop(0, `rgba(255,250,220,${alpha})`);
        hgL.addColorStop(0.3, `rgba(255,240,200,${alpha * 0.4})`);
        hgL.addColorStop(1, "transparent");
        ctx.fillStyle = hgL;
        ctx.beginPath();
        ctx.arc(cx - size, cy, size * 5, 0, Math.PI * 2);
        ctx.fill();

        // Right headlight
        const hgR = ctx.createRadialGradient(cx + size * 2, cy, 0, cx + size * 2, cy, size * 5);
        hgR.addColorStop(0, `rgba(255,250,220,${alpha})`);
        hgR.addColorStop(0.3, `rgba(255,240,200,${alpha * 0.4})`);
        hgR.addColorStop(1, "transparent");
        ctx.fillStyle = hgR;
        ctx.beginPath();
        ctx.arc(cx + size * 2, cy, size * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── ROADSIDE REFLECTORS ────────────────────────────────────────────────
      [0.15, 0.35, 0.55, 0.75, 0.92].forEach((frac) => {
        const halfW = halfWTop + (halfWBot - halfWTop) * frac;
        const ry = yHorizon + (H - yHorizon) * frac;
        const a = 0.3 + frac * 0.5;
        const size = 1.5 + frac * 2;
        [-halfW - 8, halfW + 8].forEach((rx) => {
          const rg = ctx.createRadialGradient(vx + rx, ry, 0, vx + rx, ry, size * 3);
          rg.addColorStop(0, `rgba(255,220,80,${a})`);
          rg.addColorStop(1, "transparent");
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(vx + rx, ry, size * 3, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // ─── EGO CAR DASHBOARD (bottom frame) ─────────────────────────────────
      // The car's own interior — gives the sense of sitting inside
      const dashH = H * 0.22;
      const dashY = H - dashH;

      // Dashboard base
      const dashGrad = ctx.createLinearGradient(0, dashY, 0, H);
      dashGrad.addColorStop(0, "#1a1a22");
      dashGrad.addColorStop(0.3, "#14141c");
      dashGrad.addColorStop(1, "#0c0c14");
      ctx.fillStyle = dashGrad;
      ctx.beginPath();
      ctx.moveTo(0, dashY + 20);
      ctx.bezierCurveTo(W * 0.15, dashY, W * 0.35, dashY - 8, W * 0.5, dashY - 14);
      ctx.bezierCurveTo(W * 0.65, dashY - 8, W * 0.85, dashY, W, dashY + 20);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Dashboard top edge highlight
      ctx.strokeStyle = "rgba(80,80,110,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, dashY + 20);
      ctx.bezierCurveTo(W * 0.15, dashY, W * 0.35, dashY - 8, W * 0.5, dashY - 14);
      ctx.bezierCurveTo(W * 0.65, dashY - 8, W * 0.85, dashY, W, dashY + 20);
      ctx.stroke();

      // Instrument cluster (center console glow)
      const clusterX = W * 0.5;
      const clusterY = dashY + dashH * 0.42;
      const clusterGlow = ctx.createRadialGradient(clusterX, clusterY, 0, clusterX, clusterY, 120);
      clusterGlow.addColorStop(0, "rgba(0,180,255,0.12)");
      clusterGlow.addColorStop(1, "transparent");
      ctx.fillStyle = clusterGlow;
      ctx.fillRect(clusterX - 120, clusterY - 60, 240, 100);

      // Speedometer circle
      ctx.strokeStyle = "rgba(0,200,255,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(clusterX, clusterY + 10, 36, 0, Math.PI * 2);
      ctx.stroke();

      // Speed digits
      ctx.fillStyle = "rgba(0,220,255,0.55)";
      ctx.font = "bold 13px 'Orbitron', monospace";
      ctx.textAlign = "center";
      ctx.fillText("42", clusterX, clusterY + 16);
      ctx.fillStyle = "rgba(0,180,200,0.3)";
      ctx.font = "6px 'Orbitron', monospace";
      ctx.fillText("km/h", clusterX, clusterY + 26);

      // Left vent / speaker
      const ventLX = W * 0.18;
      const ventY = clusterY + 16;
      ctx.strokeStyle = "rgba(40,40,60,0.8)";
      ctx.lineWidth = 1;
      for (let j = -2; j <= 2; j++) {
        ctx.beginPath();
        ctx.moveTo(ventLX - 20, ventY + j * 5);
        ctx.lineTo(ventLX + 20, ventY + j * 5);
        ctx.stroke();
      }

      // Right vent
      const ventRX = W * 0.82;
      for (let j = -2; j <= 2; j++) {
        ctx.beginPath();
        ctx.moveTo(ventRX - 20, ventY + j * 5);
        ctx.lineTo(ventRX + 20, ventY + j * 5);
        ctx.stroke();
      }

      // Steering wheel
      const swX = clusterX;
      const swY = H - 18;
      const swR = H * 0.18;
      // Hub glow
      const swHubGlow = ctx.createRadialGradient(swX, swY, 0, swX, swY, swR * 0.25);
      swHubGlow.addColorStop(0, "rgba(0,180,255,0.12)");
      swHubGlow.addColorStop(1, "transparent");
      ctx.fillStyle = swHubGlow;
      ctx.beginPath();
      ctx.arc(swX, swY, swR * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Rim
      ctx.strokeStyle = "rgba(50,50,70,0.9)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(swX, swY, swR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(80,80,100,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Spokes
      ctx.strokeStyle = "rgba(45,45,65,0.95)";
      ctx.lineWidth = 5;
      [210, 270, 330].forEach((deg) => {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(swX + Math.cos(rad) * swR * 0.22, swY + Math.sin(rad) * swR * 0.22);
        ctx.lineTo(swX + Math.cos(rad) * swR * 0.92, swY + Math.sin(rad) * swR * 0.92);
        ctx.stroke();
      });

      // A-pillars (windshield frame)
      // Left pillar
      const pillarGrad = ctx.createLinearGradient(0, 0, 80, 0);
      pillarGrad.addColorStop(0, "#0a0a10");
      pillarGrad.addColorStop(1, "rgba(10,10,16,0)");
      ctx.fillStyle = pillarGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(80, 0);
      ctx.lineTo(W * 0.08, H * 0.42);
      ctx.lineTo(0, H * 0.6);
      ctx.closePath();
      ctx.fill();

      // Right pillar
      const pillarGradR = ctx.createLinearGradient(W, 0, W - 80, 0);
      pillarGradR.addColorStop(0, "#0a0a10");
      pillarGradR.addColorStop(1, "rgba(10,10,16,0)");
      ctx.fillStyle = pillarGradR;
      ctx.beginPath();
      ctx.moveTo(W, 0);
      ctx.lineTo(W - 80, 0);
      ctx.lineTo(W * 0.92, H * 0.42);
      ctx.lineTo(W, H * 0.6);
      ctx.closePath();
      ctx.fill();

      // Windshield reflection (very subtle)
      const reflGrad = ctx.createLinearGradient(0, 0, W, H * 0.3);
      reflGrad.addColorStop(0, "rgba(255,255,255,0.008)");
      reflGrad.addColorStop(0.3, "rgba(255,255,255,0.012)");
      reflGrad.addColorStop(0.7, "transparent");
      ctx.fillStyle = reflGrad;
      ctx.fillRect(0, 0, W, H * 0.35);

      // ─── EMERGENCY FLASH ────────────────────────────────────────────────────
      if (emergency) {
        const eAlpha = blinkOn ? 0.14 : 0.04;
        ctx.fillStyle = `rgba(255,23,68,${eAlpha})`;
        ctx.fillRect(0, 0, W, H);
        if (blinkOn) {
          ctx.strokeStyle = "rgba(255,23,68,0.6)";
          ctx.lineWidth = 3;
          ctx.strokeRect(1, 1, W - 2, H - 2);
        }
      }

      animRef.current = requestAnimationFrame(drawFrame);
    }

    animRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [leftAlert, rightAlert, emergency, blinkOn]);

  return (
    <canvas
      ref={canvasRef}
      width={860}
      height={440}
      style={{
        width: "100%",
        display: "block",
        borderRadius: 20,
      }}
    />
  );
}
