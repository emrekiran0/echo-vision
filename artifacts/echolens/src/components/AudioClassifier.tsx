import { useRef, useEffect, useState, useCallback } from "react";

export type AudioClassification = "ambulance" | "horn" | "none";

interface Props {
  onClassificationChange: (type: AudioClassification) => void;
}

const BAR_COUNT = 36;

export default function AudioClassifier({ onClassificationChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef(0);
  const classRef = useRef<AudioClassification>("none");
  const stableCountRef = useRef(0);
  const smoothedBars = useRef<number[]>(Array(BAR_COUNT).fill(0));
  const idlePhaseRef = useRef(0);

  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [classification, setClassification] = useState<AudioClassification>("none");
  const [volume, setVolume] = useState(0);

  const stopMic = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setMicActive(false);
    setClassification("none");
    classRef.current = "none";
    setVolume(0);
    onClassificationChange("none");
  }, [onClassificationChange]);

  const startMic = useCallback(async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      streamRef.current = stream;
      analyserRef.current = analyser;
      setMicActive(true);
    } catch {
      setMicError("Microphone access denied. Tap to retry.");
    }
  }, []);

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
      idlePhaseRef.current += 0.038;

      const W = canvas.width;
      const H = canvas.height;
      const analyser = analyserRef.current;

      // Collect real frequency data or generate idle animation
      const freqData = new Float32Array(BAR_COUNT);
      let avgVol = 0;

      if (analyser && micActive) {
        const buf = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(buf);
        const step = Math.floor(buf.length / BAR_COUNT);
        for (let i = 0; i < BAR_COUNT; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += buf[i * step + j];
          freqData[i] = Math.min(1, sum / step / 255);
        }
        avgVol = freqData.reduce((a, b) => a + b, 0) / BAR_COUNT;
      } else {
        // Idle: gentle overlapping sine waves
        const t = idlePhaseRef.current;
        for (let i = 0; i < BAR_COUNT; i++) {
          freqData[i] =
            0.07 +
            0.06 * Math.sin(t + i * 0.42) +
            0.04 * Math.sin(t * 1.6 + i * 0.85) +
            0.02 * Math.sin(t * 2.5 + i * 1.3);
        }
        avgVol = 0.07;
      }

      // Smooth bars
      for (let i = 0; i < BAR_COUNT; i++) {
        smoothedBars.current[i] = smoothedBars.current[i] * 0.74 + freqData[i] * 0.26;
      }

      setVolume(avgVol);

      // AI classification heuristic
      if (micActive) {
        let newClass: AudioClassification = "none";
        if (avgVol > 0.07) {
          // Spectral centroid
          let weightedSum = 0;
          let totalWeight = 0;
          for (let i = 0; i < BAR_COUNT; i++) {
            weightedSum += i * freqData[i];
            totalWeight += freqData[i];
          }
          const centroid = totalWeight > 0 ? weightedSum / totalWeight / BAR_COUNT : 0;
          if (avgVol > 0.40) {
            newClass = centroid > 0.30 ? "ambulance" : "horn";
          } else if (avgVol > 0.11) {
            newClass = "horn";
          }
        }

        if (newClass === classRef.current) {
          stableCountRef.current = Math.min(stableCountRef.current + 1, 60);
        } else {
          if (stableCountRef.current < 10) {
            classRef.current = newClass;
            stableCountRef.current = 0;
          } else {
            stableCountRef.current = Math.max(0, stableCountRef.current - 2);
          }
        }
        if (stableCountRef.current >= 10) {
          if (classRef.current !== newClass) {
            classRef.current = newClass;
            stableCountRef.current = 0;
          }
        }
        setClassification(classRef.current);
        onClassificationChange(classRef.current);
      }

      const activeClass = classRef.current;
      const isAmbu = micActive && activeClass === "ambulance";
      const isHorn = micActive && activeClass === "horn";

      // Pulse factor for glow breathing
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.07);

      // ── Background ──────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#07080f";
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(0,229,255,0.03)";
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < W; gx += 22) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 22) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Ambient glow when alert is active
      if ((isAmbu || isHorn) && micActive) {
        const glowA = 0.10 + pulse * 0.08;
        const grd = ctx.createRadialGradient(W / 2, H, 0, W / 2, H / 2, W * 0.6);
        if (isAmbu) {
          grd.addColorStop(0, `rgba(255,23,68,${glowA})`);
        } else {
          grd.addColorStop(0, `rgba(255,210,0,${glowA})`);
        }
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Equalizer bars ──────────────────────────────────────────────────────
      const padX = 6;
      const baseY = H - 6;
      const totalW = W - padX * 2;
      const gap = 2;
      const barW = (totalW - gap * (BAR_COUNT - 1)) / BAR_COUNT;
      const maxBarH = H - 14;

      for (let i = 0; i < BAR_COUNT; i++) {
        const barH = Math.max(3, smoothedBars.current[i] * maxBarH);
        const x = padX + i * (barW + gap);
        const y = baseY - barH;

        let topColor: string;
        let botColor: string;

        if (isAmbu) {
          const isBlue = i % 2 === 1;
          const a = 0.6 + smoothedBars.current[i] * 0.4;
          topColor = isBlue ? `rgba(30,100,255,${a})` : `rgba(255,23,68,${a})`;
          botColor = isBlue ? `rgba(30,100,255,0.12)` : `rgba(255,23,68,0.12)`;
        } else if (isHorn) {
          const a = 0.55 + smoothedBars.current[i] * 0.45;
          topColor = `rgba(255,210,0,${a})`;
          botColor = `rgba(255,210,0,0.12)`;
        } else {
          const a = 0.35 + smoothedBars.current[i] * 0.35;
          topColor = `rgba(0,229,255,${a})`;
          botColor = `rgba(0,229,255,0.06)`;
        }

        const grad = ctx.createLinearGradient(x, y, x, baseY);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, botColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [1, 1, 0, 0]);
        ctx.fill();

        // Top cap glow
        if (smoothedBars.current[i] > 0.18) {
          ctx.fillStyle = topColor;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, 2, 1);
          ctx.fill();
        }
      }

      // Baseline
      ctx.strokeStyle = "rgba(0,229,255,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, baseY);
      ctx.lineTo(W - padX, baseY);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [micActive, onClassificationChange]);

  useEffect(() => () => { stopMic(); }, [stopMic]);

  // Display values
  const classLabel =
    classification === "ambulance"
      ? "AMBULANCE DETECTED"
      : classification === "horn"
      ? "HORN DETECTED"
      : "NO CRITICAL SOUND";

  const classColor =
    classification === "ambulance"
      ? "#ff1744"
      : classification === "horn"
      ? "#ffd600"
      : "#2a3a4a";

  const borderColor =
    classification === "ambulance"
      ? "rgba(255,23,68,0.50)"
      : classification === "horn"
      ? "rgba(255,214,0,0.45)"
      : "rgba(0,229,255,0.10)";

  const glowShadow =
    classification === "ambulance"
      ? "0 0 18px rgba(255,23,68,0.22)"
      : classification === "horn"
      ? "0 0 18px rgba(255,214,0,0.18)"
      : "none";

  const volPct = Math.min(100, Math.round(volume * 280));

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
          <div style={{ fontSize: 7, color: "#2a2a40", letterSpacing: "0.1em", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
            {micActive ? "● LIVE MIC INPUT ACTIVE" : "MIC INACTIVE — TAP START"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Volume bar */}
          {micActive && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
              <div style={{ fontSize: 7, color: "#2a3a4a", letterSpacing: "0.1em" }}>INPUT</div>
              <div style={{ width: 52, height: 4, background: "#12121e", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${volPct}%`,
                    height: "100%",
                    background:
                      volPct > 68 ? "#ff1744" : volPct > 35 ? "#ffd600" : "#00e5ff",
                    borderRadius: 2,
                    transition: "width 0.08s, background 0.3s",
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={micActive ? stopMic : startMic}
            style={{
              padding: "5px 11px",
              borderRadius: 6,
              border: `1px solid ${micActive ? "rgba(255,23,68,0.45)" : "rgba(0,229,255,0.35)"}`,
              background: micActive ? "rgba(255,23,68,0.10)" : "rgba(0,229,255,0.07)",
              color: micActive ? "#ff5252" : "#00e5ff",
              cursor: "pointer",
              fontFamily: "'Orbitron', monospace",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.14em",
              transition: "all 0.25s",
            }}
          >
            {micActive ? "■ STOP" : "● START"}
          </button>
        </div>
      </div>

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={88}
        style={{ width: "100%", display: "block", marginTop: 8 }}
      />

      {/* Classification result */}
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
              animation: classification !== "none" && micActive ? "pulse 1s ease-in-out infinite" : "none",
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
                textShadow:
                  classification !== "none" && micActive
                    ? `0 0 10px ${classColor}70`
                    : "none",
                transition: "color 0.4s, text-shadow 0.4s",
              }}
            >
              {classLabel}
            </div>
            <div style={{ fontSize: 7, color: "#2a2a40", letterSpacing: "0.1em", marginTop: 1 }}>
              {micActive ? "AI CLASSIFICATION ACTIVE" : "AWAITING AUDIO INPUT"}
            </div>
          </div>
        </div>

        {/* Ambulance indicator dots */}
        {classification === "ambulance" && micActive && (
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#ff1744",
                boxShadow: "0 0 8px #ff1744",
                animation: "pulse 0.55s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#1e6eff",
                boxShadow: "0 0 8px #1e6eff",
                animation: "pulse 0.55s ease-in-out infinite 0.28s",
              }}
            />
          </div>
        )}

        {/* Horn indicator dot */}
        {classification === "horn" && micActive && (
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#ffd600",
              boxShadow: "0 0 10px #ffd600",
              animation: "pulse 0.8s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Mic error */}
      {micError && (
        <div
          onClick={startMic}
          style={{
            margin: "0 10px 10px",
            padding: "8px 12px",
            background: "rgba(255,23,68,0.07)",
            border: "1px solid rgba(255,23,68,0.28)",
            borderRadius: 8,
            fontSize: 8,
            color: "#ff5252",
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          ⚠ {micError}
        </div>
      )}
    </div>
  );
}
