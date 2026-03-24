import { useEffect, useRef } from "react";

interface Props {
  tick: number;
  speed: number;
}

export default function GPSMiniMap({ tick, speed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<{ x: number; y: number }[]>([{ x: 100, y: 90 }]);
  const headingRef = useRef(Math.PI * 1.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Update path
    if (speed > 0) {
      headingRef.current += (Math.random() - 0.5) * 0.12;
      const step = speed * 0.018;
      const last = pathRef.current[pathRef.current.length - 1];
      const nx = last.x + Math.cos(headingRef.current) * step;
      const ny = last.y + Math.sin(headingRef.current) * step;

      // Bounce off edges
      if (nx < 12 || nx > W - 12) headingRef.current = Math.PI - headingRef.current;
      if (ny < 12 || ny > H - 12) headingRef.current = -headingRef.current;

      pathRef.current.push({
        x: Math.max(12, Math.min(W - 12, nx)),
        y: Math.max(12, Math.min(H - 12, ny)),
      });
      if (pathRef.current.length > 120) pathRef.current.shift();
    }

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#08081a";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(30,30,50,0.8)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Path trail
    if (pathRef.current.length > 1) {
      ctx.beginPath();
      pathRef.current.forEach((pt, i) => {
        const alpha = i / pathRef.current.length;
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else {
          ctx.strokeStyle = `rgba(0,229,255,${alpha * 0.6})`;
          ctx.lineWidth = 1.5;
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
        }
      });
    }

    // Current position
    const pos = pathRef.current[pathRef.current.length - 1];
    // Glow
    const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 12);
    glow.addColorStop(0, "rgba(0,229,255,0.4)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Arrow shape
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(headingRef.current + Math.PI / 2);
    ctx.fillStyle = "#00e5ff";
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(0, 2);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Coordinates text
    const lat = 12.9716 + (pos.x - W / 2) * 0.0001;
    const lon = 77.5946 + (pos.y - H / 2) * 0.0001;
    ctx.fillStyle = "rgba(0,229,255,0.5)";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${lat.toFixed(4)}N`, 4, H - 14);
    ctx.fillText(`${lon.toFixed(4)}E`, 4, H - 4);

    // Compass
    ctx.fillStyle = "rgba(74,74,106,0.8)";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", W - 10, 12);

  }, [tick, speed]);

  return (
    <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] text-[#4a4a6a] tracking-[0.2em]"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          GPS TRACK — NEO-6M
        </span>
        <span className="text-[10px] text-[#00e5ff]">3D FIX</span>
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={120}
        className="w-full rounded-lg"
        style={{ height: "100px" }}
      />
    </div>
  );
}
