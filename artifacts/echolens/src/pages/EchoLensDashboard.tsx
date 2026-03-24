import { useState, useEffect, useCallback } from "react";
import RealisticRoad from "../components/RealisticRoad";

type Tab = "dashboard" | "architecture";

export default function EchoLensDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [leftDist, setLeftDist] = useState(120);
  const [rightDist, setRightDist] = useState(95);
  const [leftAlert, setLeftAlert] = useState(false);
  const [rightAlert, setRightAlert] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [blinkOn, setBlinkOn] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setBlinkOn((b) => !b);
      setTick((t) => t + 1);
    }, 400);
    return () => clearInterval(iv);
  }, []);

  const triggerLeft = useCallback(() => {
    setLeftAlert(true);
    setLeftDist(28);
  }, []);

  const triggerRight = useCallback(() => {
    setRightAlert(true);
    setRightDist(32);
  }, []);

  const reset = useCallback(() => {
    setLeftAlert(false);
    setRightAlert(false);
    setEmergency(false);
    setLeftDist(120);
    setRightDist(95);
  }, []);

  const triggerEmergency = useCallback(() => {
    setEmergency((e) => !e);
    if (!emergency) {
      setLeftAlert(false);
      setRightAlert(false);
    }
  }, [emergency]);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "#060608",
        color: "#e0e0e8",
        fontFamily: "'Orbitron', monospace",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(180deg, #0c0c14 0%, #060608 100%)",
          borderBottom: "1px solid #14141e",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            👂
          </div>
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: "0.32em",
                color: "#00e5ff",
                textShadow: "0 0 18px rgba(0,229,255,0.5)",
                lineHeight: 1,
              }}
            >
              ECHOLENS
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#3a3a5a",
                letterSpacing: "0.22em",
                marginTop: 3,
              }}
            >
              HEARING-ASSISTIVE DRIVING KIT
            </div>
          </div>
        </div>

        {/* Live pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(0,230,118,0.06)",
            border: "1px solid rgba(0,230,118,0.2)",
            borderRadius: 20,
            padding: "5px 12px",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00e676",
              boxShadow: "0 0 6px #00e676",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 9, color: "#00e676", letterSpacing: "0.18em" }}>LIVE</span>
        </div>
      </header>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #14141e",
          background: "#060608",
        }}
      >
        {(["dashboard", "architecture"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 28px",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              border: "none",
              borderBottom: tab === t ? "2px solid #00e5ff" : "2px solid transparent",
              background: tab === t ? "rgba(0,229,255,0.04)" : "transparent",
              color: tab === t ? "#00e5ff" : "#3a3a5a",
              cursor: "pointer",
              fontFamily: "'Orbitron', monospace",
              transition: "all 0.2s",
            }}
          >
            {t === "dashboard" ? "Live Dashboard" : "Architecture"}
          </button>
        ))}
      </div>

      {tab === "dashboard" ? (
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px" }}>
          {/* === WINDSHIELD VIEW === */}
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              marginBottom: 16,
              boxShadow: "0 0 60px rgba(0,0,0,0.8)",
            }}
          >
            <RealisticRoad
              leftAlert={leftAlert}
              rightAlert={rightAlert}
              emergency={emergency}
              blinkOn={blinkOn}
              tick={tick}
            />

            {/* Left glow alert overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, rgba(255,23,68,0.55) 0%, rgba(255,23,68,0.18) 30%, transparent 55%)",
                pointerEvents: "none",
                opacity: leftAlert ? (blinkOn ? 1 : 0.55) : 0,
                transition: "opacity 0.4s ease",
                borderRadius: 20,
              }}
            />

            {/* Right glow alert overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to left, rgba(255,23,68,0.55) 0%, rgba(255,23,68,0.18) 30%, transparent 55%)",
                pointerEvents: "none",
                opacity: rightAlert ? (blinkOn ? 1 : 0.55) : 0,
                transition: "opacity 0.4s ease",
                borderRadius: 20,
              }}
            />

            {/* Left border glow */}
            {leftAlert && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 20,
                  border: `3px solid rgba(255,23,68,${blinkOn ? 0.9 : 0.3})`,
                  borderRight: "none",
                  borderTop: "none",
                  borderBottom: "none",
                  boxShadow: `inset 6px 0 30px rgba(255,23,68,${blinkOn ? 0.5 : 0.15})`,
                  pointerEvents: "none",
                  transition: "all 0.4s ease",
                }}
              />
            )}

            {/* Right border glow */}
            {rightAlert && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 20,
                  border: `3px solid rgba(255,23,68,${blinkOn ? 0.9 : 0.3})`,
                  borderLeft: "none",
                  borderTop: "none",
                  borderBottom: "none",
                  boxShadow: `inset -6px 0 30px rgba(255,23,68,${blinkOn ? 0.5 : 0.15})`,
                  pointerEvents: "none",
                  transition: "all 0.4s ease",
                }}
              />
            )}

            {/* Left BLIND SPOT label */}
            {leftAlert && (
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                  opacity: blinkOn ? 1 : 0.5,
                  transition: "opacity 0.4s ease",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#ff5252",
                    letterSpacing: "0.15em",
                    textShadow: "0 0 12px rgba(255,23,68,0.8)",
                  }}
                >
                  ◀ BLIND SPOT
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#ff1744",
                    textShadow: "0 0 16px rgba(255,23,68,0.9)",
                  }}
                >
                  {leftDist}cm
                </div>
              </div>
            )}

            {/* Right BLIND SPOT label */}
            {rightAlert && (
              <div
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                  opacity: blinkOn ? 1 : 0.5,
                  transition: "opacity 0.4s ease",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#ff5252",
                    letterSpacing: "0.15em",
                    textShadow: "0 0 12px rgba(255,23,68,0.8)",
                  }}
                >
                  BLIND SPOT ▶
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#ff1744",
                    textShadow: "0 0 16px rgba(255,23,68,0.9)",
                  }}
                >
                  {rightDist}cm
                </div>
              </div>
            )}

            {/* Emergency overlay */}
            {emergency && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: blinkOn
                    ? "rgba(255,23,68,0.18)"
                    : "rgba(60,0,0,0.25)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  pointerEvents: "none",
                  transition: "background 0.4s",
                  borderRadius: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: blinkOn ? "#fff" : "#ff5252",
                    letterSpacing: "0.2em",
                    textShadow: "0 0 24px rgba(255,23,68,1)",
                  }}
                >
                  ⚠ EMERGENCY VEHICLE
                </div>
                <div style={{ fontSize: 10, color: "#ff9999", letterSpacing: "0.15em" }}>
                  PULL OVER SAFELY
                </div>
              </div>
            )}
          </div>

          {/* Distance panels */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <DistPanel
              label="LEFT"
              value={leftDist}
              alert={leftAlert}
              blinkOn={blinkOn}
            />
            <DistPanel
              label="RIGHT"
              value={rightDist}
              alert={rightAlert}
              blinkOn={blinkOn}
            />
          </div>

          {/* Controls */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            <ControlButton
              label="◀ LEFT"
              onClick={triggerLeft}
              active={leftAlert}
              color="#ff1744"
            />
            <ControlButton
              label="RESET"
              onClick={reset}
              active={false}
              color="#00e5ff"
              isReset
            />
            <ControlButton
              label="RIGHT ▶"
              onClick={triggerRight}
              active={rightAlert}
              color="#ff1744"
            />
          </div>

          {/* Emergency button */}
          <button
            onClick={triggerEmergency}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: `1.5px solid ${emergency ? "rgba(255,23,68,0.7)" : "rgba(255,23,68,0.2)"}`,
              background: emergency ? "rgba(255,23,68,0.15)" : "rgba(255,23,68,0.04)",
              color: emergency ? "#ff1744" : "#5a2a2a",
              cursor: "pointer",
              fontFamily: "'Orbitron', monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              transition: "all 0.3s",
              boxShadow: emergency ? "0 0 20px rgba(255,23,68,0.25)" : "none",
            }}
          >
            {emergency ? "⬛ STOP EMERGENCY" : "🚑 TRIGGER EMERGENCY ALERT"}
          </button>
        </main>
      ) : (
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px" }}>
          <ArchitectureTab />
        </main>
      )}

      <footer
        style={{
          textAlign: "center",
          padding: "16px",
          borderTop: "1px solid #10101a",
          fontSize: 9,
          color: "#20202e",
          letterSpacing: "0.15em",
          marginTop: 8,
        }}
      >
        ECHOLENS © 2026 — ESP32 + Edge Impulse TinyML + ThingSpeak IoT + FreeRTOS
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function DistPanel({
  label,
  value,
  alert,
  blinkOn,
}: {
  label: string;
  value: number;
  alert: boolean;
  blinkOn: boolean;
}) {
  const color = alert ? "#ff1744" : value < 100 ? "#ffd600" : "#00e676";

  return (
    <div
      style={{
        background: "#0a0a12",
        border: `1.5px solid ${alert ? (blinkOn ? "rgba(255,23,68,0.7)" : "rgba(80,0,0,0.6)") : "#14141e"}`,
        borderRadius: 12,
        padding: "16px",
        textAlign: "center",
        boxShadow: alert && blinkOn ? "0 0 24px rgba(255,23,68,0.25)" : "none",
        transition: "all 0.3s",
      }}
    >
      <div style={{ fontSize: 9, color: "#3a3a5a", letterSpacing: "0.22em", marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color,
          textShadow: `0 0 16px ${color}80`,
          lineHeight: 1,
          transition: "color 0.3s",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: "#3a3a5a", marginTop: 4 }}>cm</div>
      {alert && (
        <div
          style={{
            marginTop: 8,
            fontSize: 9,
            color: blinkOn ? "#ffd600" : "#ff5252",
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}
        >
          ⚠ BLIND SPOT
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  active,
  color,
  isReset,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  color: string;
  isReset?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "13px 8px",
        borderRadius: 10,
        border: `1.5px solid ${isReset ? "rgba(0,229,255,0.3)" : active ? `${color}90` : `${color}25`}`,
        background: isReset
          ? "rgba(0,229,255,0.06)"
          : active
          ? `${color}18`
          : `${color}06`,
        color: isReset ? "#00e5ff" : active ? color : `${color}60`,
        cursor: "pointer",
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.18em",
        transition: "all 0.25s",
        boxShadow: active ? `0 0 16px ${color}30` : isReset ? "0 0 12px rgba(0,229,255,0.1)" : "none",
      }}
    >
      {label}
    </button>
  );
}

function ArchitectureTab() {
  const boxStyle = (color: string) => ({
    padding: "10px 14px",
    borderRadius: 10,
    border: `1.5px solid ${color}40`,
    background: `${color}0a`,
    fontSize: 10,
    color: "#c0c0d8",
    textAlign: "center" as const,
    flex: 1,
    minWidth: 90,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Kart 1 */}
      <div
        style={{
          background: "#0a0a12",
          border: "1px solid #14141e",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 11, color: "#ffab00", letterSpacing: "0.18em", marginBottom: 14, fontWeight: 700 }}>
          KART 1 — SENSOR UNIT (ESP32)
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={boxStyle("#00e5ff")}>🎤 PDM Mic<br /><span style={{ fontSize: 9, color: "#3a3a5a" }}>TinyML Audio</span></div>
          <div style={boxStyle("#00e676")}>📡 Ultrasonic<br /><span style={{ fontSize: 9, color: "#3a3a5a" }}>L + R Sensors</span></div>
          <div style={boxStyle("#ff9100")}>🛰 GPS<br /><span style={{ fontSize: 9, color: "#3a3a5a" }}>NEO-6M</span></div>
          <div style={boxStyle("#ffd600")}>🔊 Buzzer<br /><span style={{ fontSize: 9, color: "#3a3a5a" }}>Alert Sound</span></div>
        </div>
      </div>

      <div style={{ textAlign: "center", color: "#ffab00", fontSize: 11, letterSpacing: "0.1em" }}>
        ── ESP-NOW (Wireless, &lt;5ms) ──▶
      </div>

      {/* Kart 2 */}
      <div
        style={{
          background: "#0a0a12",
          border: "1px solid #14141e",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 11, color: "#00e5ff", letterSpacing: "0.18em", marginBottom: 14, fontWeight: 700 }}>
          KART 2 — DISPLAY UNIT (ESP32)
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={boxStyle("#ff9100")}>🖥 TFT Display<br /><span style={{ fontSize: 9, color: "#3a3a5a" }}>ILI9341 320×240</span></div>
          <div style={boxStyle("#00e676")}>📶 WiFi<br /><span style={{ fontSize: 9, color: "#3a3a5a" }}>ThingSpeak IoT</span></div>
          <div style={boxStyle("#00e5ff")}>⚡ FreeRTOS<br /><span style={{ fontSize: 9, color: "#3a3a5a" }}>Dual Core</span></div>
        </div>
      </div>

      <div style={{ textAlign: "center", color: "#00e676", fontSize: 11, letterSpacing: "0.1em" }}>
        ── WiFi / HTTP ──▶
      </div>

      {/* Cloud */}
      <div
        style={{
          background: "#0a0a12",
          border: "1px solid rgba(0,230,118,0.2)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, marginBottom: 4 }}>☁</div>
        <div style={{ fontSize: 11, color: "#00e676", letterSpacing: "0.18em", fontWeight: 700 }}>THINGSPEAK CLOUD</div>
        <div style={{ fontSize: 9, color: "#3a3a5a", marginTop: 4 }}>Dashboard + Analytics + MATLAB Visualizations</div>
      </div>

      {/* Audio classes */}
      <div
        style={{
          background: "#0a0a12",
          border: "1px solid #14141e",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 9, color: "#3a3a5a", letterSpacing: "0.2em", marginBottom: 10 }}>
          TINYML AUDIO CLASSIFICATION
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🚨", label: "emergency", color: "#ff1744" },
            { icon: "🗣", label: "human", color: "#ffd600" },
            { icon: "🚗", label: "traffic", color: "#ff9100" },
            { icon: "🔇", label: "silent", color: "#4a4a6a" },
          ].map((c) => (
            <span
              key={c.label}
              style={{
                fontSize: 10,
                padding: "4px 10px",
                borderRadius: 6,
                background: `${c.color}18`,
                color: c.color,
                border: `1px solid ${c.color}30`,
              }}
            >
              {c.icon} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
