import { useState, useEffect, useCallback } from "react";

const COLORS = {
  bg: "#0a0a0f",
  surface: "#12121a",
  surfaceLight: "#1a1a25",
  border: "#2a2a3a",
  text: "#e0e0e8",
  textDim: "#6a6a7a",
  green: "#00e676",
  red: "#ff1744",
  orange: "#ff9100",
  yellow: "#ffd600",
  cyan: "#00e5ff",
  amber: "#ffab00",
  roadGray: "#1e1e2a",
  lane: "#ffab00",
};

/* ============================================================
 *  PERSPECTIVE ROAD CANVAS
 * ============================================================ */
function PerspectiveRoad({ leftDist, rightDist, emergency, blinkOn }) {
  const canvasRef = useState(null);

  useEffect(() => {
    const canvas = document.getElementById("road-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    if (emergency) {
      ctx.fillStyle = blinkOn ? "#d32f2f" : "#4a0000";
      ctx.fillRect(0, 0, W, H);
      ctx.font = "bold 28px 'Orbitron', monospace";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText("⚠ EMERGENCY!", W / 2, 60);
      ctx.font = "bold 22px 'Orbitron', monospace";
      ctx.fillStyle = COLORS.yellow;
      ctx.fillText("GIVE WAY", W / 2, 100);
      ctx.font = "40px serif";
      ctx.fillText("🚑", 30, 70);
      return;
    }

    ctx.fillStyle = COLORS.surface;
    ctx.fillRect(0, 0, W, H);

    const vx = W / 2;
    const halfWTop = 20;
    const halfWBot = 80;
    const yTop = 10;
    const yBot = H - 10;

    // Road surface
    ctx.beginPath();
    ctx.moveTo(vx - halfWTop, yTop);
    ctx.lineTo(vx + halfWTop, yTop);
    ctx.lineTo(vx + halfWBot, yBot);
    ctx.lineTo(vx - halfWBot, yBot);
    ctx.closePath();
    ctx.fillStyle = COLORS.roadGray;
    ctx.fill();

    // Edge lines
    ctx.strokeStyle = COLORS.lane;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(vx - halfWTop, yTop);
    ctx.lineTo(vx - halfWBot, yBot);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vx + halfWTop, yTop);
    ctx.lineTo(vx + halfWBot, yBot);
    ctx.stroke();

    // Animated center dashes
    const dashLen = 15;
    const gapLen = 12;
    const period = dashLen + gapLen;
    const offset = (Date.now() / 40) % period;

    ctx.strokeStyle = COLORS.lane;
    ctx.lineWidth = 2;
    for (let y = yTop - period + offset; y < yBot; y += period) {
      const y1 = Math.max(y, yTop);
      const y2 = Math.min(y + dashLen, yBot);
      if (y2 > y1) {
        ctx.beginPath();
        ctx.moveTo(vx, y1);
        ctx.lineTo(vx, y2);
        ctx.stroke();
      }
    }

    // Car
    const carY = H * 0.55;
    const carW = 30;
    const carH = 50;
    const carX = vx - carW / 2;

    // Car body
    ctx.fillStyle = "#1a8a8a";
    ctx.beginPath();
    ctx.roundRect(carX, carY, carW, carH, 8);
    ctx.fill();

    // Windshield
    ctx.fillStyle = "#0d4a5a";
    ctx.beginPath();
    ctx.roundRect(carX + 4, carY + 4, carW - 8, 14, 3);
    ctx.fill();

    // Rear window
    ctx.fillStyle = "#0d4a5a";
    ctx.beginPath();
    ctx.roundRect(carX + 4, carY + carH - 14, carW - 8, 10, 3);
    ctx.fill();

    // Headlights
    ctx.fillStyle = "#ffe066";
    ctx.fillRect(carX + 2, carY, 5, 4);
    ctx.fillRect(carX + carW - 7, carY, 5, 4);

    // Blind spot warnings
    if (leftDist > 0 && leftDist < 50) {
      const alpha = blinkOn ? 0.8 : 0.3;
      ctx.fillStyle = `rgba(255, 23, 68, ${alpha})`;
      ctx.fillRect(0, H * 0.3, vx - halfWBot * 0.6, H * 0.4);
      ctx.font = "bold 14px 'Orbitron', monospace";
      ctx.fillStyle = blinkOn ? "#fff" : "#ff5252";
      ctx.textAlign = "center";
      ctx.fillText("◀ LEFT", 40, H * 0.52);
    }

    if (rightDist > 0 && rightDist < 50) {
      const alpha = blinkOn ? 0.8 : 0.3;
      ctx.fillStyle = `rgba(255, 23, 68, ${alpha})`;
      ctx.fillRect(vx + halfWBot * 0.6, H * 0.3, W - vx - halfWBot * 0.6, H * 0.4);
      ctx.font = "bold 14px 'Orbitron', monospace";
      ctx.fillStyle = blinkOn ? "#fff" : "#ff5252";
      ctx.textAlign = "center";
      ctx.fillText("RIGHT ▶", W - 40, H * 0.52);
    }
  });

  return (
    <canvas
      id="road-canvas"
      width={320}
      height={220}
      style={{
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}
    />
  );
}

/* ============================================================
 *  DISTANCE PANEL
 * ============================================================ */
function DistPanel({ label, value, alert, blinkOn }) {
  const borderColor = alert ? (blinkOn ? COLORS.red : "#4a0000") : COLORS.border;
  const bgColor = alert ? (blinkOn ? "rgba(255,23,68,0.15)" : "rgba(255,23,68,0.05)") : COLORS.surface;
  const valColor = alert ? COLORS.red : value < 0 ? COLORS.textDim : COLORS.green;

  return (
    <div
      style={{
        flex: 1,
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: "10px",
        padding: "12px 16px",
        textAlign: "center",
        transition: "all 0.2s",
      }}
    >
      <div style={{ fontSize: "11px", color: COLORS.textDim, letterSpacing: "2px", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "32px", fontWeight: "bold", color: valColor, fontFamily: "'Orbitron', monospace" }}>
        {value < 0 ? "---" : value}
      </div>
      <div style={{ fontSize: "11px", color: COLORS.textDim }}>cm</div>
      {alert && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "10px",
            fontWeight: "bold",
            color: blinkOn ? COLORS.yellow : COLORS.red,
            letterSpacing: "1px",
          }}
        >
          ⚠ BLIND SPOT
        </div>
      )}
    </div>
  );
}

/* ============================================================
 *  STATUS DOT
 * ============================================================ */
function StatusDot({ label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span style={{ fontSize: "10px", color: COLORS.textDim, letterSpacing: "1px" }}>{label}</span>
    </div>
  );
}

/* ============================================================
 *  SYSTEM ARCHITECTURE
 * ============================================================ */
function Architecture() {
  const boxStyle = (color) => ({
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${color}`,
    background: `${color}15`,
    fontSize: "11px",
    color: COLORS.text,
    textAlign: "center",
    minWidth: "90px",
  });

  const arrowStyle = {
    color: COLORS.textDim,
    fontSize: "18px",
    padding: "0 4px",
  };

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div style={{ fontSize: "13px", color: COLORS.cyan, letterSpacing: "2px", marginBottom: "16px", fontWeight: "bold" }}>
        SYSTEM ARCHITECTURE
      </div>

      {/* Kart 1 */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "11px", color: COLORS.amber, marginBottom: "8px", fontWeight: "bold" }}>
          KART 1 — Sensor Unit (ESP32)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", justifyContent: "center" }}>
          <div style={boxStyle(COLORS.cyan)}>🎤 PDM Mic<br /><span style={{ fontSize: "9px", color: COLORS.textDim }}>TinyML Audio</span></div>
          <div style={boxStyle(COLORS.green)}>📡 Ultrasonic<br /><span style={{ fontSize: "9px", color: COLORS.textDim }}>L + R Sensors</span></div>
          <div style={boxStyle(COLORS.orange)}>🛰 GPS<br /><span style={{ fontSize: "9px", color: COLORS.textDim }}>NEO-6M</span></div>
          <div style={boxStyle(COLORS.yellow)}>🔊 Buzzer<br /><span style={{ fontSize: "9px", color: COLORS.textDim }}>Alert Sound</span></div>
        </div>
      </div>

      {/* Arrow */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <span style={{ color: COLORS.amber, fontSize: "12px", letterSpacing: "1px" }}>
          ── ESP-NOW (Wireless) ──▶
        </span>
      </div>

      {/* Kart 2 */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "11px", color: COLORS.cyan, marginBottom: "8px", fontWeight: "bold" }}>
          KART 2 — Display Unit (ESP32)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", justifyContent: "center" }}>
          <div style={boxStyle(COLORS.orange)}>🖥 TFT Display<br /><span style={{ fontSize: "9px", color: COLORS.textDim }}>ILI9341 320x240</span></div>
          <div style={boxStyle(COLORS.green)}>📶 WiFi<br /><span style={{ fontSize: "9px", color: COLORS.textDim }}>ThingSpeak IoT</span></div>
          <div style={boxStyle(COLORS.cyan)}>⚡ FreeRTOS<br /><span style={{ fontSize: "9px", color: COLORS.textDim }}>Dual Core</span></div>
        </div>
      </div>

      {/* Arrow */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <span style={{ color: COLORS.green, fontSize: "12px", letterSpacing: "1px" }}>
          ── WiFi / HTTP ──▶
        </span>
      </div>

      {/* Cloud */}
      <div style={{ textAlign: "center" }}>
        <div style={boxStyle(COLORS.green)}>☁ ThingSpeak Cloud<br /><span style={{ fontSize: "9px", color: COLORS.textDim }}>Dashboard + Analytics</span></div>
      </div>

      {/* Audio Classes */}
      <div
        style={{
          marginTop: "16px",
          padding: "10px",
          borderRadius: "8px",
          background: COLORS.surfaceLight,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ fontSize: "10px", color: COLORS.textDim, marginBottom: "6px", letterSpacing: "1px" }}>
          TINYML AUDIO CLASSIFICATION
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: `${COLORS.red}30`, color: COLORS.red }}>
            🚨 emergency
          </span>
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: `${COLORS.yellow}30`, color: COLORS.yellow }}>
            🗣 human
          </span>
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: `${COLORS.orange}30`, color: COLORS.orange }}>
            🚗 traffic
          </span>
          <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: `${COLORS.textDim}30`, color: COLORS.textDim }}>
            ❓ unknown
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 *  MAIN APP
 * ============================================================ */
export default function App() {
  const [leftDist, setLeftDist] = useState(120);
  const [rightDist, setRightDist] = useState(95);
  const [emergency, setEmergency] = useState(false);
  const [blinkOn, setBlinkOn] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState("dashboard");

  // Blink & animation timer
  useEffect(() => {
    const iv = setInterval(() => {
      setBlinkOn((b) => !b);
      setTick((t) => t + 1);
    }, 400);
    return () => clearInterval(iv);
  }, []);

  // Redraw road canvas on every tick
  useEffect(() => {
    // trigger re-render for canvas
  }, [tick, leftDist, rightDist, emergency]);

  const leftAlert = leftDist > 0 && leftDist < 50;
  const rightAlert = rightDist > 0 && rightDist < 50;

  const sliderStyle = {
    width: "100%",
    accentColor: COLORS.cyan,
    background: "transparent",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Orbitron', 'SF Mono', 'Fira Code', monospace",
        padding: "0",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${COLORS.surfaceLight} 0%, ${COLORS.bg} 100%)`,
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "16px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "900", letterSpacing: "6px", color: COLORS.cyan }}>
          ECHOLENS
        </div>
        <div style={{ fontSize: "10px", color: COLORS.textDim, letterSpacing: "3px", marginTop: "4px" }}>
          HEARING-ASSISTIVE DRIVING KIT
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0", borderBottom: `1px solid ${COLORS.border}` }}>
        {["dashboard", "architecture"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 24px",
              background: tab === t ? COLORS.surfaceLight : "transparent",
              color: tab === t ? COLORS.cyan : COLORS.textDim,
              border: "none",
              borderBottom: tab === t ? `2px solid ${COLORS.cyan}` : "2px solid transparent",
              cursor: "pointer",
              fontSize: "11px",
              letterSpacing: "2px",
              fontFamily: "inherit",
              textTransform: "uppercase",
            }}
          >
            {t === "dashboard" ? "Live Dashboard" : "Architecture"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "420px", margin: "0 auto", padding: "16px" }}>
        {tab === "dashboard" ? (
          <>
            {/* Road Canvas */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <PerspectiveRoad
                leftDist={leftDist}
                rightDist={rightDist}
                emergency={emergency}
                blinkOn={blinkOn}
              />
            </div>

            {/* Distance Panels */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <DistPanel label="LEFT" value={leftDist} alert={leftAlert} blinkOn={blinkOn} />
              <DistPanel label="RIGHT" value={rightDist} alert={rightAlert} blinkOn={blinkOn} />
            </div>

            {/* Controls */}
            <div
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "12px",
              }}
            >
              <div style={{ fontSize: "10px", color: COLORS.textDim, letterSpacing: "2px", marginBottom: "10px" }}>
                SIMULATION CONTROLS
              </div>

              <div style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: COLORS.textDim }}>Left Sensor</span>
                  <span style={{ fontSize: "12px", color: leftAlert ? COLORS.red : COLORS.green, fontWeight: "bold" }}>
                    {leftDist} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={leftDist}
                  onChange={(e) => setLeftDist(Number(e.target.value))}
                  style={sliderStyle}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: COLORS.textDim }}>Right Sensor</span>
                  <span style={{ fontSize: "12px", color: rightAlert ? COLORS.red : COLORS.green, fontWeight: "bold" }}>
                    {rightDist} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={rightDist}
                  onChange={(e) => setRightDist(Number(e.target.value))}
                  style={sliderStyle}
                />
              </div>

              <button
                onClick={() => setEmergency(!emergency)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: `2px solid ${emergency ? COLORS.red : COLORS.border}`,
                  background: emergency ? `${COLORS.red}25` : COLORS.surfaceLight,
                  color: emergency ? COLORS.red : COLORS.textDim,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {emergency ? "🚨 STOP EMERGENCY" : "🚑 TRIGGER EMERGENCY"}
              </button>
            </div>

            {/* Status */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "8px 12px",
                background: COLORS.surface,
                borderRadius: "8px",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <StatusDot label="ESP-NOW" color={COLORS.green} />
              <StatusDot label="WiFi" color={COLORS.green} />
              <StatusDot label="ThingSpeak" color={COLORS.green} />
              <StatusDot label="GPS" color={COLORS.cyan} />
            </div>
          </>
        ) : (
          <Architecture />
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "9px", color: COLORS.textDim, letterSpacing: "1px" }}>
          EchoLens © 2026 — ESP32 + Edge Impulse TinyML + ThingSpeak IoT
        </div>
      </div>
    </div>
  );
}
