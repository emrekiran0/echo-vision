import { useRef, useEffect } from "react";

interface Props {
  leftAlert: boolean;
  rightAlert: boolean;
  emergency: boolean;
  blinkOn: boolean;
  tick: number;
}

export default function RealisticRoad({ leftAlert, rightAlert, emergency, blinkOn }: Props) {
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

      const horizonY = H * 0.40;

      // ─── SKY ────────────────────────────────────────────────────────────────
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, "#3a7bd5");
      skyGrad.addColorStop(0.45, "#5a9fe8");
      skyGrad.addColorStop(0.8, "#88c0f5");
      skyGrad.addColorStop(1, "#b8d9f8");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY);

      // Sun
      const sunX = W * 0.72;
      const sunY = horizonY * 0.28;
      // Sun halo outer
      const sunHalo2 = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 90);
      sunHalo2.addColorStop(0, "rgba(255,245,180,0.18)");
      sunHalo2.addColorStop(1, "transparent");
      ctx.fillStyle = sunHalo2;
      ctx.beginPath(); ctx.arc(sunX, sunY, 90, 0, Math.PI * 2); ctx.fill();
      // Sun halo inner
      const sunHalo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 44);
      sunHalo.addColorStop(0, "rgba(255,255,220,0.65)");
      sunHalo.addColorStop(0.5, "rgba(255,235,140,0.25)");
      sunHalo.addColorStop(1, "transparent");
      ctx.fillStyle = sunHalo;
      ctx.beginPath(); ctx.arc(sunX, sunY, 44, 0, Math.PI * 2); ctx.fill();
      // Sun disc
      const sunDisc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 18);
      sunDisc.addColorStop(0, "#fffde0");
      sunDisc.addColorStop(0.6, "#ffe87a");
      sunDisc.addColorStop(1, "#ffcc44");
      ctx.fillStyle = sunDisc;
      ctx.beginPath(); ctx.arc(sunX, sunY, 18, 0, Math.PI * 2); ctx.fill();

      // Clouds
      const clouds = [
        { cx: W * 0.12, cy: horizonY * 0.3, rx: 70, ry: 22 },
        { cx: W * 0.28, cy: horizonY * 0.18, rx: 55, ry: 18 },
        { cx: W * 0.45, cy: horizonY * 0.35, rx: 85, ry: 26 },
        { cx: W * 0.62, cy: horizonY * 0.12, rx: 48, ry: 16 },
        { cx: W * 0.86, cy: horizonY * 0.42, rx: 62, ry: 20 },
      ];
      clouds.forEach(({ cx, cy, rx, ry }) => {
        // Cloud puffs
        [
          [cx, cy, rx * 0.55, ry],
          [cx - rx * 0.38, cy + ry * 0.3, rx * 0.42, ry * 0.8],
          [cx + rx * 0.38, cy + ry * 0.3, rx * 0.42, ry * 0.8],
          [cx - rx * 0.7, cy + ry * 0.55, rx * 0.32, ry * 0.65],
          [cx + rx * 0.7, cy + ry * 0.55, rx * 0.32, ry * 0.65],
        ].forEach(([px, py, prx, pry]) => {
          ctx.fillStyle = "rgba(255,255,255,0.82)";
          ctx.beginPath();
          ctx.ellipse(px, py, prx, pry, 0, 0, Math.PI * 2);
          ctx.fill();
        });
        // Cloud bottom shadow
        const cloudShadow = ctx.createLinearGradient(cx, cy, cx, cy + ry * 1.5);
        cloudShadow.addColorStop(0, "transparent");
        cloudShadow.addColorStop(1, "rgba(160,190,220,0.2)");
        ctx.fillStyle = cloudShadow;
        ctx.beginPath();
        ctx.ellipse(cx, cy + ry * 0.6, rx * 0.9, ry * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Horizon atmospheric haze
      const hazeGrad = ctx.createLinearGradient(0, horizonY - 18, 0, horizonY + 10);
      hazeGrad.addColorStop(0, "rgba(190,220,250,0.55)");
      hazeGrad.addColorStop(0.5, "rgba(210,232,252,0.3)");
      hazeGrad.addColorStop(1, "transparent");
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, horizonY - 18, W, 28);

      // ─── TREELINE ───────────────────────────────────────────────────────────
      // Far distant trees (pale blue-green)
      for (let tx = 0; tx < W; tx += 18) {
        const th = 14 + Math.sin(tx * 0.18) * 7 + Math.sin(tx * 0.07) * 5;
        ctx.fillStyle = `rgba(100,155,100,${0.4 + Math.sin(tx * 0.1) * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(tx, horizonY);
        ctx.lineTo(tx + 9, horizonY - th);
        ctx.lineTo(tx + 18, horizonY);
        ctx.closePath();
        ctx.fill();
      }
      // Closer trees (darker green)
      for (let tx = 0; tx < W; tx += 14) {
        const th = 20 + Math.sin(tx * 0.13 + 1) * 9 + Math.sin(tx * 0.05 + 2) * 7;
        ctx.fillStyle = `rgba(55,110,60,${0.7 + Math.sin(tx * 0.09) * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(tx, horizonY + 4);
        ctx.lineTo(tx + 7, horizonY + 4 - th);
        ctx.lineTo(tx + 14, horizonY + 4);
        ctx.closePath();
        ctx.fill();
      }

      // ─── GRASSY SHOULDERS ───────────────────────────────────────────────────
      const vx = W * 0.5;
      const halfWTop = 36;
      const halfWBot = W * 0.56;
      const yHorizon = horizonY + 6;

      // Left grass
      const grassGrad = ctx.createLinearGradient(0, yHorizon, 0, H);
      grassGrad.addColorStop(0, "#6a9e50");
      grassGrad.addColorStop(0.3, "#5a8e42");
      grassGrad.addColorStop(1, "#4a7a35");
      ctx.fillStyle = grassGrad;
      ctx.beginPath();
      ctx.moveTo(0, yHorizon);
      ctx.lineTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx - halfWBot, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      // Right grass
      ctx.fillStyle = grassGrad;
      ctx.beginPath();
      ctx.moveTo(W, yHorizon);
      ctx.lineTo(vx + halfWTop, yHorizon);
      ctx.lineTo(vx + halfWBot, H);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Grass shadow near road edge
      const grassShadowL = ctx.createLinearGradient(vx - halfWTop, 0, vx - halfWTop - 60, 0);
      grassShadowL.addColorStop(0, "rgba(0,0,0,0.08)");
      grassShadowL.addColorStop(1, "transparent");
      ctx.fillStyle = grassShadowL;
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx - halfWTop - 60, yHorizon);
      ctx.lineTo(vx - halfWBot - 60, H);
      ctx.lineTo(vx - halfWBot, H);
      ctx.closePath();
      ctx.fill();

      // ─── ROAD SURFACE ────────────────────────────────────────────────────────
      // Daylight asphalt — warm mid-grey
      const asphaltGrad = ctx.createLinearGradient(0, yHorizon, 0, H);
      asphaltGrad.addColorStop(0, "#686870");
      asphaltGrad.addColorStop(0.2, "#5e5e68");
      asphaltGrad.addColorStop(0.6, "#585860");
      asphaltGrad.addColorStop(1, "#525258");
      ctx.fillStyle = asphaltGrad;
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx + halfWTop, yHorizon);
      ctx.lineTo(vx + halfWBot, H);
      ctx.lineTo(vx - halfWBot, H);
      ctx.closePath();
      ctx.fill();

      // Road sheen — sun reflecting off the asphalt near horizon
      const sheenGrad = ctx.createLinearGradient(0, yHorizon, 0, yHorizon + (H - yHorizon) * 0.35);
      sheenGrad.addColorStop(0, "rgba(255,255,240,0.18)");
      sheenGrad.addColorStop(0.5, "rgba(255,255,240,0.06)");
      sheenGrad.addColorStop(1, "transparent");
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx + halfWTop, yHorizon);
      ctx.lineTo(vx + halfWBot * 0.55, yHorizon + (H - yHorizon) * 0.35);
      ctx.lineTo(vx - halfWBot * 0.55, yHorizon + (H - yHorizon) * 0.35);
      ctx.closePath();
      ctx.fill();

      // Asphalt texture — subtle horizontal variation
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx + halfWTop, yHorizon);
      ctx.lineTo(vx + halfWBot, H);
      ctx.lineTo(vx - halfWBot, H);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = 0.018;
      for (let i = 0; i < 60; i++) {
        const x = (i * 33 + 5) % W;
        ctx.strokeStyle = i % 3 === 0 ? "#ffffff" : "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, yHorizon); ctx.lineTo(x + 28, H); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ─── SUN GLINT on road ──────────────────────────────────────────────────
      const glintX = vx + (sunX - W * 0.5) * 0.4;
      const glintGrad = ctx.createRadialGradient(glintX, yHorizon + 20, 0, glintX, yHorizon + 20, 120);
      glintGrad.addColorStop(0, "rgba(255,255,210,0.22)");
      glintGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glintGrad;
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx + halfWTop, yHorizon);
      ctx.lineTo(vx + halfWBot * 0.7, yHorizon + (H - yHorizon) * 0.5);
      ctx.lineTo(vx - halfWBot * 0.7, yHorizon + (H - yHorizon) * 0.5);
      ctx.closePath();
      ctx.fill();

      // ─── WHITE EDGE LINES ────────────────────────────────────────────────────
      const steps = 60;
      for (let i = 0; i < steps; i++) {
        const f0 = i / steps;
        const f1 = (i + 1) / steps;
        const lx0 = vx - (halfWTop + (halfWBot - halfWTop) * f0) - 2;
        const lx1 = vx - (halfWTop + (halfWBot - halfWTop) * f1) - 2;
        const rx0 = vx + (halfWTop + (halfWBot - halfWTop) * f0) + 2;
        const rx1 = vx + (halfWTop + (halfWBot - halfWTop) * f1) + 2;
        const y0 = yHorizon + (H - yHorizon) * f0;
        const y1 = yHorizon + (H - yHorizon) * f1;
        const lw = Math.max(0.8, f0 * 3.2);
        ctx.strokeStyle = `rgba(255,255,255,${0.75 + f0 * 0.2})`;
        ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(lx0, y0); ctx.lineTo(lx1, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx0, y0); ctx.lineTo(rx1, y1); ctx.stroke();
      }

      // Road shadow near edge (asphalt darkens at edge)
      const edgeShadowL = ctx.createLinearGradient(vx - halfWBot, 0, vx - halfWBot + 30, 0);
      edgeShadowL.addColorStop(0, "rgba(0,0,0,0.18)");
      edgeShadowL.addColorStop(1, "transparent");
      ctx.fillStyle = edgeShadowL;
      ctx.beginPath();
      ctx.moveTo(vx - halfWTop, yHorizon);
      ctx.lineTo(vx - halfWTop + 25, yHorizon);
      ctx.lineTo(vx - halfWBot + 25, H);
      ctx.lineTo(vx - halfWBot, H);
      ctx.closePath();
      ctx.fill();

      // ─── LANE DASHES (animated) ──────────────────────────────────────────────
      const laneFracs = [-0.33, 0, 0.33];
      laneFracs.forEach((lf) => {
        for (let i = 0; i < steps; i++) {
          const f0 = i / steps;
          const f1 = (i + 1) / steps;
          const halfW0 = halfWTop + (halfWBot - halfWTop) * f0;
          const halfW1 = halfWTop + (halfWBot - halfWTop) * f1;
          const lx0 = vx + lf * halfW0 * 0.65;
          const lx1 = vx + lf * halfW1 * 0.65;
          const y0 = yHorizon + (H - yHorizon) * f0;
          const y1 = yHorizon + (H - yHorizon) * f1;

          const totalLen = H - yHorizon;
          const distFromVP = f0 * totalLen;
          const dashPeriod = 70;
          const dashLen = 38;
          const phase = (distFromVP - dashOffset * (lf === 0 ? 1.5 : 1.0)) % dashPeriod;
          if (phase >= 0 && phase < dashLen) {
            const lw = Math.max(0.5, f0 * (lf === 0 ? 2.0 : 1.4));
            const alpha = lf === 0 ? 0.88 : 0.58;
            ctx.strokeStyle = `rgba(255,255,255,${alpha * (0.4 + f0 * 0.6)})`;
            ctx.lineWidth = lw;
            ctx.beginPath(); ctx.moveTo(lx0, y0); ctx.lineTo(lx1, y1); ctx.stroke();
          }
        }
      });

      // ─── ROADSIDE DETAILS ────────────────────────────────────────────────────
      // Painted edge marking (yellow) left and right outer
      for (let i = 0; i < steps; i++) {
        const f0 = i / steps;
        const f1 = (i + 1) / steps;
        const lx0 = vx - (halfWTop + (halfWBot - halfWTop) * f0) + 12;
        const lx1 = vx - (halfWTop + (halfWBot - halfWTop) * f1) + 12;
        const rx0 = vx + (halfWTop + (halfWBot - halfWTop) * f0) - 12;
        const rx1 = vx + (halfWTop + (halfWBot - halfWTop) * f1) - 12;
        const y0 = yHorizon + (H - yHorizon) * f0;
        const y1 = yHorizon + (H - yHorizon) * f1;
        const lw = Math.max(0.4, f0 * 1.8);
        ctx.strokeStyle = `rgba(255,215,0,${0.55 + f0 * 0.3})`;
        ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(lx0, y0); ctx.lineTo(lx1, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx0, y0); ctx.lineTo(rx1, y1); ctx.stroke();
      }

      // Road cats-eye reflectors
      [0.12, 0.3, 0.5, 0.68, 0.85].forEach((frac) => {
        const halfW = halfWTop + (halfWBot - halfWTop) * frac;
        const ry = yHorizon + (H - yHorizon) * frac;
        const size = 1.5 + frac * 2.5;
        [-halfW - 6, halfW + 6].forEach((rx) => {
          ctx.fillStyle = `rgba(255,230,100,${0.4 + frac * 0.35})`;
          ctx.beginPath();
          ctx.ellipse(vx + rx, ry, size, size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // ─── DASHBOARD / INTERIOR ────────────────────────────────────────────────
      const dashH = H * 0.21;
      const dashY = H - dashH;

      // Dashboard — dark interior, lit by daylight from the windshield
      const dashGrad = ctx.createLinearGradient(0, dashY, 0, H);
      dashGrad.addColorStop(0, "#1c1c24");
      dashGrad.addColorStop(0.25, "#181820");
      dashGrad.addColorStop(1, "#111118");
      ctx.fillStyle = dashGrad;
      ctx.beginPath();
      ctx.moveTo(0, dashY + 18);
      ctx.bezierCurveTo(W * 0.15, dashY - 2, W * 0.35, dashY - 10, W * 0.5, dashY - 16);
      ctx.bezierCurveTo(W * 0.65, dashY - 10, W * 0.85, dashY - 2, W, dashY + 18);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Daylight top-edge highlight on dashboard
      ctx.strokeStyle = "rgba(160,200,240,0.22)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, dashY + 18);
      ctx.bezierCurveTo(W * 0.15, dashY - 2, W * 0.35, dashY - 10, W * 0.5, dashY - 16);
      ctx.bezierCurveTo(W * 0.65, dashY - 10, W * 0.85, dashY - 2, W, dashY + 18);
      ctx.stroke();

      // Instrument cluster ambient (cyan-tinted day display)
      const clusterX = W * 0.5;
      const clusterY = dashY + dashH * 0.42;
      const clusterGlow = ctx.createRadialGradient(clusterX, clusterY, 0, clusterX, clusterY, 90);
      clusterGlow.addColorStop(0, "rgba(80,200,255,0.1)");
      clusterGlow.addColorStop(1, "transparent");
      ctx.fillStyle = clusterGlow;
      ctx.fillRect(clusterX - 90, clusterY - 50, 180, 90);

      // Speedometer circle
      ctx.strokeStyle = "rgba(100,210,255,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(clusterX, clusterY + 8, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Speed readout
      ctx.fillStyle = "rgba(0,210,255,0.65)";
      ctx.font = "bold 13px 'Orbitron', monospace";
      ctx.textAlign = "center";
      ctx.fillText("42", clusterX, clusterY + 14);
      ctx.fillStyle = "rgba(0,180,200,0.35)";
      ctx.font = "6px 'Orbitron', monospace";
      ctx.fillText("km/h", clusterX, clusterY + 24);

      // Vents
      [W * 0.18, W * 0.82].forEach((ventX) => {
        ctx.strokeStyle = "rgba(35,35,50,0.9)";
        ctx.lineWidth = 1;
        for (let j = -2; j <= 2; j++) {
          ctx.beginPath();
          ctx.moveTo(ventX - 18, clusterY + 14 + j * 5);
          ctx.lineTo(ventX + 18, clusterY + 14 + j * 5);
          ctx.stroke();
        }
      });

      // Steering wheel
      const swX = clusterX;
      const swY = H - 16;
      const swR = H * 0.17;

      ctx.strokeStyle = "rgba(40,40,55,0.95)";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(swX, swY, swR, 0, Math.PI * 2);
      ctx.stroke();
      // Rim highlight (daylight)
      ctx.strokeStyle = "rgba(120,150,180,0.18)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(swX, swY, swR, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Spokes
      ctx.strokeStyle = "rgba(38,38,52,0.95)";
      ctx.lineWidth = 5;
      [210, 270, 330].forEach((deg) => {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(swX + Math.cos(rad) * swR * 0.22, swY + Math.sin(rad) * swR * 0.22);
        ctx.lineTo(swX + Math.cos(rad) * swR * 0.92, swY + Math.sin(rad) * swR * 0.92);
        ctx.stroke();
      });

      // A-pillars (windshield frame)
      const pillarGradL = ctx.createLinearGradient(0, 0, 90, 0);
      pillarGradL.addColorStop(0, "#111118");
      pillarGradL.addColorStop(1, "rgba(16,16,22,0)");
      ctx.fillStyle = pillarGradL;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(90, 0);
      ctx.lineTo(W * 0.08, H * 0.41); ctx.lineTo(0, H * 0.58);
      ctx.closePath(); ctx.fill();

      const pillarGradR = ctx.createLinearGradient(W, 0, W - 90, 0);
      pillarGradR.addColorStop(0, "#111118");
      pillarGradR.addColorStop(1, "rgba(16,16,22,0)");
      ctx.fillStyle = pillarGradR;
      ctx.beginPath();
      ctx.moveTo(W, 0); ctx.lineTo(W - 90, 0);
      ctx.lineTo(W * 0.92, H * 0.41); ctx.lineTo(W, H * 0.58);
      ctx.closePath(); ctx.fill();

      // Windshield tint — subtle blue-tinted glass effect
      const wsTint = ctx.createLinearGradient(0, 0, 0, H * 0.42);
      wsTint.addColorStop(0, "rgba(160,200,240,0.06)");
      wsTint.addColorStop(0.5, "rgba(180,215,245,0.03)");
      wsTint.addColorStop(1, "transparent");
      ctx.fillStyle = wsTint;
      ctx.fillRect(0, 0, W, H * 0.42);

      // ─── EMERGENCY FLASH ─────────────────────────────────────────────────────
      if (emergency) {
        const eAlpha = blinkOn ? 0.15 : 0.04;
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
      style={{ width: "100%", display: "block", borderRadius: 20 }}
    />
  );
}
