import { useRef, useEffect } from "react";

interface Props {
  leftDist: number;
  rightDist: number;
  emergency: boolean;
  blinkOn: boolean;
  tick: number;
}

export default function PerspectiveRoad({ leftDist, rightDist, emergency, blinkOn, tick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (emergency) {
      // Emergency screen
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, blinkOn ? "#3d0000" : "#1a0000");
      grad.addColorStop(1, blinkOn ? "#1a0000" : "#0a0000");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Flashing border
      if (blinkOn) {
        ctx.strokeStyle = "#ff1744";
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, W - 4, H - 4);
        ctx.strokeStyle = "rgba(255,23,68,0.3)";
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, W - 12, H - 12);
      }

      // Ambulance silhouette (simple)
      ctx.save();
      ctx.translate(W / 2, H / 2 - 20);
      // body
      ctx.fillStyle = blinkOn ? "#ff5252" : "#cc2222";
      ctx.beginPath();
      ctx.roundRect(-28, -14, 56, 28, 4);
      ctx.fill();
      // cab
      ctx.fillStyle = blinkOn ? "#ff7777" : "#aa1111";
      ctx.beginPath();
      ctx.roundRect(10, -22, 18, 14, 3);
      ctx.fill();
      // cross
      ctx.fillStyle = "#fff";
      ctx.fillRect(-6, -8, 12, 4);
      ctx.fillRect(-2, -12, 4, 12);
      // wheels
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(-18, 14, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(18, 14, 6, 0, Math.PI * 2); ctx.fill();
      // lights
      if (blinkOn) {
        ctx.fillStyle = "#ff0000";
        ctx.beginPath(); ctx.arc(-8, -24, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0088ff";
        ctx.beginPath(); ctx.arc(8, -24, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      ctx.font = `bold 14px 'Orbitron', monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = blinkOn ? "#ffffff" : "#ff5252";
      ctx.fillText("⚠  EMERGENCY VEHICLE", W / 2, H - 48);
      ctx.fillStyle = blinkOn ? "#ffd600" : "#cc9900";
      ctx.font = `bold 11px 'Orbitron', monospace`;
      ctx.fillText("GIVE WAY — PULL OVER", W / 2, H - 28);
      return;
    }

    // ---- NORMAL ROAD VIEW ----
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.38);
    sky.addColorStop(0, "#030310");
    sky.addColorStop(1, "#0a0a20");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars
    const starData = [
      [40, 30], [90, 15], [130, 45], [180, 20], [220, 35], [260, 10],
      [300, 28], [340, 42], [380, 18], [420, 36], [460, 12], [500, 30],
    ];
    starData.forEach(([sx, sy]) => {
      const twinkle = Math.sin(tick * 0.3 + sx) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + twinkle * 0.5})`;
      ctx.fill();
    });

    // Horizon glow
    const horizonGrad = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, W * 0.6);
    horizonGrad.addColorStop(0, "rgba(0,100,180,0.25)");
    horizonGrad.addColorStop(1, "transparent");
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, W, H);

    // Road surface
    const vx = W / 2;
    const yHorizon = H * 0.38;
    const halfWTop = 28;
    const halfWBot = 145;

    const roadGrad = ctx.createLinearGradient(0, yHorizon, 0, H);
    roadGrad.addColorStop(0, "#141420");
    roadGrad.addColorStop(0.5, "#1a1a28");
    roadGrad.addColorStop(1, "#111118");
    ctx.fillStyle = roadGrad;
    ctx.beginPath();
    ctx.moveTo(vx - halfWTop, yHorizon);
    ctx.lineTo(vx + halfWTop, yHorizon);
    ctx.lineTo(vx + halfWBot, H);
    ctx.lineTo(vx - halfWBot, H);
    ctx.closePath();
    ctx.fill();

    // Road edges (rumble strips)
    const edgeGrad = ctx.createLinearGradient(0, yHorizon, 0, H);
    edgeGrad.addColorStop(0, "rgba(255,171,0,0.4)");
    edgeGrad.addColorStop(1, "rgba(255,171,0,0.9)");
    ctx.strokeStyle = edgeGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(vx - halfWTop, yHorizon);
    ctx.lineTo(vx - halfWBot, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vx + halfWTop, yHorizon);
    ctx.lineTo(vx + halfWBot, H);
    ctx.stroke();

    // Road glow from headlights
    const headlightGrad = ctx.createRadialGradient(vx, H, 0, vx, H, 240);
    headlightGrad.addColorStop(0, "rgba(200,200,255,0.06)");
    headlightGrad.addColorStop(1, "transparent");
    ctx.fillStyle = headlightGrad;
    ctx.beginPath();
    ctx.moveTo(vx - halfWTop, yHorizon);
    ctx.lineTo(vx + halfWTop, yHorizon);
    ctx.lineTo(vx + halfWBot, H);
    ctx.lineTo(vx - halfWBot, H);
    ctx.closePath();
    ctx.fill();

    // Center dashes (animated)
    const dashLen = 18;
    const gapLen = 14;
    const period = dashLen + gapLen;
    const now = Date.now();
    const offset = (now / 30) % period;

    for (let frac = 0; frac <= 1; frac += 0.01) {
      const y = yHorizon + (H - yHorizon) * frac;
      const halfW = halfWTop + (halfWBot - halfWTop) * frac;
      const dashW = Math.max(1, halfW * 0.03);
      const laneW = halfW * 0.48;

      // Only draw dashes in intervals
      const distFromTop = (H - yHorizon) * frac;
      const dashPhase = (distFromTop + offset) % period;
      if (dashPhase < dashLen) {
        ctx.beginPath();
        ctx.moveTo(vx - laneW, y);
        ctx.lineTo(vx - laneW, y + 0.5);
        ctx.lineWidth = dashW;
        ctx.strokeStyle = "rgba(255,171,0,0.4)";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vx + laneW, y);
        ctx.lineTo(vx + laneW, y + 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vx, y);
        ctx.lineTo(vx, y + 0.5);
        ctx.lineWidth = dashW * 1.2;
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.stroke();
      }
    }

    // Distance markers on road
    [0.3, 0.5, 0.7, 0.9].forEach((frac) => {
      const y = yHorizon + (H - yHorizon) * frac;
      const halfW = halfWTop + (halfWBot - halfWTop) * frac;
      ctx.strokeStyle = "rgba(255,171,0,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(vx - halfW, y);
      ctx.lineTo(vx + halfW, y);
      ctx.stroke();
    });

    // Ego car (our vehicle)
    const carW = 50;
    const carH = 78;
    const carX = vx - carW / 2;
    const carY = H - carH - 8;

    // Car shadow
    const shadowGrad = ctx.createRadialGradient(vx, H - 4, 0, vx, H - 4, carW * 1.2);
    shadowGrad.addColorStop(0, "rgba(0,0,0,0.6)");
    shadowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(carX - 10, H - 20, carW + 20, 20);

    // Car body
    ctx.fillStyle = "#1a6080";
    ctx.beginPath();
    ctx.roundRect(carX, carY, carW, carH, [8, 8, 4, 4]);
    ctx.fill();

    // Car body highlight
    const bodyHighlight = ctx.createLinearGradient(carX, carY, carX + carW, carY);
    bodyHighlight.addColorStop(0, "rgba(255,255,255,0.12)");
    bodyHighlight.addColorStop(0.5, "rgba(255,255,255,0.04)");
    bodyHighlight.addColorStop(1, "rgba(0,0,0,0.15)");
    ctx.fillStyle = bodyHighlight;
    ctx.beginPath();
    ctx.roundRect(carX, carY, carW, carH, [8, 8, 4, 4]);
    ctx.fill();

    // Windshield
    const wsGrad = ctx.createLinearGradient(carX + 5, carY + 5, carX + 5, carY + 22);
    wsGrad.addColorStop(0, "rgba(100,200,255,0.3)");
    wsGrad.addColorStop(1, "rgba(50,100,200,0.15)");
    ctx.fillStyle = wsGrad;
    ctx.beginPath();
    ctx.roundRect(carX + 5, carY + 5, carW - 10, 18, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(100,200,255,0.2)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Rear window
    const rwGrad = ctx.createLinearGradient(carX + 5, carY + carH - 20, carX + 5, carY + carH - 4);
    rwGrad.addColorStop(0, "rgba(50,100,200,0.15)");
    rwGrad.addColorStop(1, "rgba(80,160,220,0.25)");
    ctx.fillStyle = rwGrad;
    ctx.beginPath();
    ctx.roundRect(carX + 5, carY + carH - 20, carW - 10, 16, 3);
    ctx.fill();

    // Headlights
    [carX + 4, carX + carW - 10].forEach((lx) => {
      const headlightGlowL = ctx.createRadialGradient(lx + 3, carY + 2, 0, lx + 3, carY + 2, 18);
      headlightGlowL.addColorStop(0, "rgba(255,240,180,0.8)");
      headlightGlowL.addColorStop(0.3, "rgba(255,220,120,0.4)");
      headlightGlowL.addColorStop(1, "transparent");
      ctx.fillStyle = headlightGlowL;
      ctx.fillRect(lx - 12, carY - 10, 30, 25);

      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.roundRect(lx, carY, 6, 5, 1);
      ctx.fill();
    });

    // Tail lights
    [carX + 3, carX + carW - 9].forEach((lx) => {
      ctx.fillStyle = "rgba(255,50,50,0.9)";
      ctx.beginPath();
      ctx.roundRect(lx, carY + carH - 6, 6, 5, 1);
      ctx.fill();
      const tailGlow = ctx.createRadialGradient(lx + 3, carY + carH - 3, 0, lx + 3, carY + carH - 3, 15);
      tailGlow.addColorStop(0, "rgba(255,50,50,0.5)");
      tailGlow.addColorStop(1, "transparent");
      ctx.fillStyle = tailGlow;
      ctx.fillRect(lx - 8, carY + carH - 15, 22, 20);
    });

    // Side mirrors
    [-2, carW].forEach((mx) => {
      ctx.fillStyle = "#124455";
      ctx.beginPath();
      ctx.roundRect(carX + mx, carY + 12, 2, 8, 1);
      ctx.fill();
    });

    // Car roof detail
    ctx.fillStyle = "#124455";
    ctx.beginPath();
    ctx.roundRect(carX + 8, carY + 24, carW - 16, carH - 50, 2);
    ctx.fill();

    // ---- BLIND SPOT OVERLAYS ----
    const leftRoadEdgeX = vx - halfWBot;
    const rightRoadEdgeX = vx + halfWBot;

    if (leftDist > 0 && leftDist < 50) {
      const alpha = blinkOn ? 0.22 : 0.08;
      const leftZoneX = leftRoadEdgeX - 60;
      const leftZoneW = 60;

      const leftDanger = ctx.createLinearGradient(leftZoneX, 0, leftZoneX + leftZoneW, 0);
      leftDanger.addColorStop(0, `rgba(255,23,68,0)`);
      leftDanger.addColorStop(1, `rgba(255,23,68,${alpha})`);
      ctx.fillStyle = leftDanger;
      ctx.fillRect(leftZoneX, yHorizon * 0.6, leftZoneW, H - yHorizon * 0.6);

      if (blinkOn) {
        ctx.font = `bold 11px 'Orbitron', monospace`;
        ctx.fillStyle = "#ff1744";
        ctx.textAlign = "right";
        ctx.fillText(`◀ ${leftDist}cm`, leftRoadEdgeX - 4, H - 80);
        ctx.font = `bold 10px 'Orbitron', monospace`;
        ctx.fillText("BLIND SPOT", leftRoadEdgeX - 4, H - 65);
      }

      // Warning triangle
      const tx = leftRoadEdgeX - 30;
      const ty = H * 0.65;
      ctx.fillStyle = blinkOn ? "#ff1744" : "#880011";
      ctx.beginPath();
      ctx.moveTo(tx, ty - 12);
      ctx.lineTo(tx + 12, ty + 8);
      ctx.lineTo(tx - 12, ty + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", tx, ty + 6);
    }

    if (rightDist > 0 && rightDist < 50) {
      const alpha = blinkOn ? 0.22 : 0.08;
      const rightZoneX = rightRoadEdgeX;
      const rightZoneW = 60;

      const rightDanger = ctx.createLinearGradient(rightZoneX, 0, rightZoneX + rightZoneW, 0);
      rightDanger.addColorStop(0, `rgba(255,23,68,${alpha})`);
      rightDanger.addColorStop(1, `rgba(255,23,68,0)`);
      ctx.fillStyle = rightDanger;
      ctx.fillRect(rightZoneX, yHorizon * 0.6, rightZoneW, H - yHorizon * 0.6);

      if (blinkOn) {
        ctx.font = `bold 11px 'Orbitron', monospace`;
        ctx.fillStyle = "#ff1744";
        ctx.textAlign = "left";
        ctx.fillText(`${rightDist}cm ▶`, rightRoadEdgeX + 4, H - 80);
        ctx.font = `bold 10px 'Orbitron', monospace`;
        ctx.fillText("BLIND SPOT", rightRoadEdgeX + 4, H - 65);
      }

      const tx = rightRoadEdgeX + 30;
      const ty = H * 0.65;
      ctx.fillStyle = blinkOn ? "#ff1744" : "#880011";
      ctx.beginPath();
      ctx.moveTo(tx, ty - 12);
      ctx.lineTo(tx + 12, ty + 8);
      ctx.lineTo(tx - 12, ty + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", tx, ty + 6);
    }

    // Oncoming traffic (decorative dots far away)
    [vx - 8, vx + 8].forEach((lx, i) => {
      const phase = (tick * 0.04 + i * 0.5) % 1;
      const ty2 = yHorizon + (H * 0.25 - yHorizon) * phase;
      const size = 1 + phase * 3;
      const a = 0.5 - phase * 0.4;
      ctx.beginPath();
      ctx.arc(lx, ty2, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,240,180,${a})`;
      ctx.fill();
    });

  }, [leftDist, rightDist, emergency, blinkOn, tick]);

  return (
    <canvas
      ref={canvasRef}
      width={540}
      height={280}
      className="w-full rounded-lg border border-[#1e1e2e]"
      style={{ maxHeight: "280px", objectFit: "contain" }}
    />
  );
}
