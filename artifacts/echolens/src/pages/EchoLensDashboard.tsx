import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import RealisticRoad from "../components/RealisticRoad";
import SonarRadar from "../components/SonarRadar";
import AudioClassifier, { AudioClassification } from "../components/AudioClassifier";

type Tab = "dashboard" | "architecture";

interface Props {
  initialTab?: Tab;
  onBack?: () => void;
}

export default function EchoLensDashboard({ initialTab = "dashboard", onBack }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [leftDist, setLeftDist] = useState(120);
  const [rightDist, setRightDist] = useState(95);
  const [leftAlert, setLeftAlert] = useState(false);
  const [rightAlert, setRightAlert] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [hornDetected, setHornDetected] = useState(false);
  const [blinkOn, setBlinkOn] = useState(false);
  const [tick, setTick] = useState(0);

  // Blink + tick timer
  useEffect(() => {
    const iv = setInterval(() => {
      setBlinkOn((b) => !b);
      setTick((t) => t + 1);
    }, 400);
    return () => clearInterval(iv);
  }, []);

  // Random fluctuation when no alert is active
  useEffect(() => {
    const iv = setInterval(() => {
      setLeftAlert((la) => {
        if (!la) {
          setLeftDist((d) => {
            const next = d + (Math.random() * 10 - 5);
            return Math.round(Math.max(60, Math.min(180, next)));
          });
        }
        return la;
      });
      setRightAlert((ra) => {
        if (!ra) {
          setRightDist((d) => {
            const next = d + (Math.random() * 10 - 5);
            return Math.round(Math.max(60, Math.min(180, next)));
          });
        }
        return ra;
      });
    }, 600);
    return () => clearInterval(iv);
  }, []);

  // Animate distance down to 50 when alert triggered
  const animateDown = useCallback((
    setter: Dispatch<SetStateAction<number>>,
    alertSetter: Dispatch<SetStateAction<boolean>>,
    current: number
  ) => {
    let val = current;
    const step = () => {
      val = Math.max(50, val - Math.ceil((val - 50) * 0.25 + 2));
      setter(val);
      if (val > 50) {
        setTimeout(step, 60);
      } else {
        alertSetter(true);
      }
    };
    step();
  }, []);

  const triggerLeft = useCallback(() => {
    setLeftAlert(false);
    setLeftDist((d) => { animateDown(setLeftDist, setLeftAlert, d); return d; });
  }, [animateDown]);

  const triggerRight = useCallback(() => {
    setRightAlert(false);
    setRightDist((d) => { animateDown(setRightDist, setRightAlert, d); return d; });
  }, [animateDown]);

  const reset = useCallback(() => {
    setLeftAlert(false);
    setRightAlert(false);
    setEmergency(false);
    setHornDetected(false);
    setLeftDist(120);
    setRightDist(95);
  }, []);

  const triggerEmergency = useCallback(() => {
    setEmergency((e) => {
      if (!e) { setLeftAlert(false); setRightAlert(false); }
      return !e;
    });
  }, []);

  const audioClassification: AudioClassification =
    emergency ? "ambulance" : hornDetected ? "horn" : "none";

  const leftAlertFinal = leftAlert || emergency;
  const rightAlertFinal = rightAlert || emergency;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060608",
        color: "#e0e0e8",
        fontFamily: "'Orbitron', monospace",
      }}
    >
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header
        style={{
          background: "linear-gradient(180deg,#0c0c14 0%,#060608 100%)",
          borderBottom: "1px solid #14141e",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            👂
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "0.3em",
                color: "#00e5ff",
                textShadow: "0 0 16px rgba(0,229,255,0.5)",
                lineHeight: 1,
              }}
            >
              ECHOLENS
            </div>
            <div style={{ fontSize: 8, color: "#2e2e4e", letterSpacing: "0.2em", marginTop: 3 }}>
              HEARING-ASSISTIVE DRIVING KIT
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(0,230,118,0.07)",
              border: "1px solid rgba(0,230,118,0.22)",
              borderRadius: 20,
              padding: "5px 12px",
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#00e676",
                boxShadow: "0 0 5px #00e676",
              }}
            />
            <span style={{ fontSize: 8, color: "#00e676", letterSpacing: "0.18em" }}>LIVE</span>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: "1px solid #14141e",
                background: "transparent",
                color: "#3a3a5a",
                cursor: "pointer",
                fontFamily: "'Orbitron', monospace",
                fontSize: 8,
                letterSpacing: "0.18em",
              }}
            >
              ← HOME
            </button>
          )}
        </div>
      </header>

      {/* ── TABS ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "1px solid #14141e" }}>
        {(["dashboard", "architecture"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 24px",
              fontSize: 10,
              letterSpacing: "0.18em",
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
        <main style={{ maxWidth: 680, margin: "0 auto", padding: "16px 14px 32px" }}>

          {/* ── ROAD VIEW ──────────────────────────────────────────────────────── */}
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 12,
              boxShadow: "0 0 40px rgba(0,0,0,0.7)",
            }}
          >
            <RealisticRoad
              leftAlert={leftAlertFinal}
              rightAlert={rightAlertFinal}
              emergency={emergency}
              blinkOn={blinkOn}
              tick={tick}
            />

            {/* Left glow overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right,rgba(255,23,68,0.5) 0%,rgba(255,23,68,0.15) 28%,transparent 52%)",
                pointerEvents: "none",
                opacity: leftAlertFinal ? (blinkOn ? 1 : 0.5) : 0,
                transition: "opacity 0.35s ease",
              }}
            />
            {/* Right glow overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to left,rgba(255,23,68,0.5) 0%,rgba(255,23,68,0.15) 28%,transparent 52%)",
                pointerEvents: "none",
                opacity: rightAlertFinal ? (blinkOn ? 1 : 0.5) : 0,
                transition: "opacity 0.35s ease",
              }}
            />

            {/* Left border glow */}
            {leftAlertFinal && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  borderLeft: `3px solid rgba(255,23,68,${blinkOn ? 0.9 : 0.25})`,
                  boxShadow: `inset 5px 0 24px rgba(255,23,68,${blinkOn ? 0.45 : 0.12})`,
                  pointerEvents: "none",
                  transition: "all 0.35s",
                }}
              />
            )}
            {/* Right border glow */}
            {rightAlertFinal && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  borderRight: `3px solid rgba(255,23,68,${blinkOn ? 0.9 : 0.25})`,
                  boxShadow: `inset -5px 0 24px rgba(255,23,68,${blinkOn ? 0.45 : 0.12})`,
                  pointerEvents: "none",
                  transition: "all 0.35s",
                }}
              />
            )}

            {/* Left label */}
            {leftAlertFinal && (
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: blinkOn ? 1 : 0.5,
                  transition: "opacity 0.35s",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontSize: 10, color: "#ff5252", letterSpacing: "0.12em", textShadow: "0 0 10px rgba(255,23,68,0.8)" }}>◀ BLIND SPOT</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#ff1744", textShadow: "0 0 14px rgba(255,23,68,0.9)" }}>{leftDist}cm</div>
              </div>
            )}
            {/* Right label */}
            {rightAlertFinal && (
              <div
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  textAlign: "right",
                  opacity: blinkOn ? 1 : 0.5,
                  transition: "opacity 0.35s",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontSize: 10, color: "#ff5252", letterSpacing: "0.12em", textShadow: "0 0 10px rgba(255,23,68,0.8)" }}>BLIND SPOT ▶</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#ff1744", textShadow: "0 0 14px rgba(255,23,68,0.9)" }}>{rightDist}cm</div>
              </div>
            )}

            {/* Emergency overlay */}
            {emergency && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: blinkOn ? "rgba(255,23,68,0.16)" : "rgba(50,0,0,0.22)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  transition: "background 0.35s",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 900, color: blinkOn ? "#fff" : "#ff5252", letterSpacing: "0.2em", textShadow: "0 0 20px rgba(255,23,68,1)" }}>⚠ EMERGENCY VEHICLE</div>
                <div style={{ fontSize: 9, color: "#ff9999", letterSpacing: "0.15em", marginTop: 4 }}>PULL OVER SAFELY</div>
              </div>
            )}
          </div>

          {/* ── DISTANCE PANELS ──────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <DistPanel label="LEFT" value={leftDist} alert={leftAlertFinal} blinkOn={blinkOn} />
            <DistPanel label="RIGHT" value={rightDist} alert={rightAlertFinal} blinkOn={blinkOn} />
          </div>

          {/* ── ACTION BUTTONS ───────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            <CtrlBtn label="◀ LEFT" onClick={triggerLeft} active={leftAlert} color="#ff1744" />
            <CtrlBtn label="RESET" onClick={reset} color="#00e5ff" isReset />
            <CtrlBtn label="RIGHT ▶" onClick={triggerRight} active={rightAlert} color="#ff1744" />
          </div>

          <button
            onClick={triggerEmergency}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 9,
              border: `1.5px solid ${emergency ? "rgba(255,23,68,0.65)" : "rgba(255,23,68,0.18)"}`,
              background: emergency ? "rgba(255,23,68,0.14)" : "rgba(255,23,68,0.04)",
              color: emergency ? "#ff1744" : "#4a2020",
              cursor: "pointer",
              fontFamily: "'Orbitron', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.18em",
              transition: "all 0.25s",
              boxShadow: emergency ? "0 0 16px rgba(255,23,68,0.22)" : "none",
              marginBottom: 20,
            }}
          >
            {emergency ? "⬛ STOP EMERGENCY" : "🚑 TRIGGER EMERGENCY ALERT"}
          </button>

          <button
            onClick={() => setHornDetected((h) => !h)}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 9,
              border: `1.5px solid ${hornDetected ? "rgba(255,210,0,0.65)" : "rgba(255,210,0,0.18)"}`,
              background: hornDetected ? "rgba(255,210,0,0.10)" : "rgba(255,210,0,0.03)",
              color: hornDetected ? "#ffd600" : "#4a4020",
              cursor: "pointer",
              fontFamily: "'Orbitron', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.18em",
              transition: "all 0.25s",
              boxShadow: hornDetected ? "0 0 16px rgba(255,210,0,0.18)" : "none",
              marginBottom: 20,
            }}
          >
            {hornDetected ? "⬛ STOP HORN ALERT" : "📯 TRIGGER HORN ALERT"}
          </button>

          {/* ── SEPARATOR ────────────────────────────────────────────────────── */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(to right, transparent, rgba(100,80,200,0.5), rgba(0,229,255,0.4), rgba(100,80,200,0.5), transparent)",
              marginBottom: 20,
            }}
          />

          {/* ── SONAR RADAR ──────────────────────────────────────────────────── */}
          <SonarRadar
            leftAlert={leftAlertFinal}
            rightAlert={rightAlertFinal}
            leftDist={leftDist}
            rightDist={rightDist}
            emergency={emergency}
            emergencyType="ambulance"
            hornDetected={hornDetected}
            tick={tick}
          />

          {/* ── AI AUDIO CLASSIFIER ──────────────────────────────────────────── */}
          <AudioClassifier classification={audioClassification} />
        </main>
      ) : (
        <main style={{ maxWidth: 680, margin: "0 auto", padding: "16px 14px 32px" }}>
          <ArchTab />
        </main>
      )}

      {/* ── HORN FULL-SCREEN OVERLAY ─────────────────────────────────────────── */}
      {hornDetected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: blinkOn ? "rgba(255,214,0,0.11)" : "rgba(80,55,0,0.16)",
            border: `2px solid rgba(255,214,0,${blinkOn ? 0.55 : 0.18})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 200,
            transition: "background 0.45s, border-color 0.45s",
            boxShadow: `inset 0 0 60px rgba(255,214,0,${blinkOn ? 0.18 : 0.06})`,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: blinkOn ? "#fff" : "#ffd600",
              letterSpacing: "0.22em",
              textShadow: "0 0 22px rgba(255,214,0,0.95)",
              fontFamily: "'Orbitron', monospace",
            }}
          >
            ⚠ HORN ALERT
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#ffe57a",
              letterSpacing: "0.18em",
              marginTop: 6,
              fontFamily: "'Orbitron', monospace",
            }}
          >
            CHECK SURROUNDINGS
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function DistPanel({ label, value, alert, blinkOn }: { label: string; value: number; alert: boolean; blinkOn: boolean }) {
  const color = alert ? "#ff1744" : value < 100 ? "#ffd600" : "#00e676";
  return (
    <div
      style={{
        background: "#0a0a12",
        border: `1.5px solid ${alert ? (blinkOn ? "rgba(255,23,68,0.65)" : "rgba(80,0,0,0.5)") : "#14141e"}`,
        borderRadius: 10,
        padding: "14px 12px",
        textAlign: "center",
        boxShadow: alert && blinkOn ? "0 0 20px rgba(255,23,68,0.22)" : "none",
        transition: "all 0.3s",
      }}
    >
      <div style={{ fontSize: 8, color: "#3a3a5a", letterSpacing: "0.22em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 900, color, textShadow: `0 0 14px ${color}80`, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: "#3a3a5a", marginTop: 3 }}>CM</div>
    </div>
  );
}

function CtrlBtn({ label, onClick, active, color, isReset }: { label: string; onClick: () => void; active?: boolean; color: string; isReset?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "11px 6px",
        borderRadius: 9,
        border: `1.5px solid ${isReset ? "rgba(0,229,255,0.35)" : active ? `${color}80` : `${color}22`}`,
        background: isReset ? "rgba(0,229,255,0.07)" : active ? `${color}16` : `${color}05`,
        color: isReset ? "#00e5ff" : active ? color : `${color}55`,
        cursor: "pointer",
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        transition: "all 0.22s",
        boxShadow: active ? `0 0 14px ${color}28` : isReset ? "0 0 10px rgba(0,229,255,0.08)" : "none",
      }}
    >
      {label}
    </button>
  );
}

function ArchTab() {
  const box = (color: string) => ({
    padding: "10px 12px",
    borderRadius: 9,
    border: `1.5px solid ${color}38`,
    background: `${color}08`,
    fontSize: 9,
    color: "#c0c0d8",
    textAlign: "center" as const,
    flex: 1,
    minWidth: 80,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        {
          title: "KART 1 — SENSOR UNIT (ESP32)",
          color: "#ffab00",
          items: [
            { icon: "🎤", label: "PDM Mic", sub: "TinyML Audio" },
            { icon: "📡", label: "Ultrasonic", sub: "L + R HC-SR04" },
            { icon: "🛰", label: "GPS NEO-6M", sub: "UART 9600" },
            { icon: "🔊", label: "Buzzer", sub: "PWM 2kHz" },
          ],
        },
        {
          title: "KART 2 — DISPLAY UNIT (ESP32)",
          color: "#00e5ff",
          items: [
            { icon: "🖥", label: "TFT Display", sub: "ILI9341 SPI" },
            { icon: "📶", label: "WiFi", sub: "ThingSpeak" },
            { icon: "⚡", label: "FreeRTOS", sub: "Dual Core" },
            { icon: "🔔", label: "Alerts", sub: "Visual + Buzzer" },
          ],
        },
      ].map((section) => (
        <div key={section.title} style={{ background: "#0a0a12", border: "1px solid #14141e", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 10, color: section.color, letterSpacing: "0.18em", marginBottom: 12, fontWeight: 700 }}>
            {section.title}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {section.items.map((item) => (
              <div key={item.label} style={box(section.color)}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 8, color: "#3a3a5a", marginTop: 2 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {[
        { label: "── ESP-NOW 2.4 GHz ──▶ <5ms", color: "#ffab00" },
        { label: "── WiFi / HTTP POST ──▶ 15s", color: "#00e676" },
      ].map((arr) => (
        <div key={arr.label} style={{ textAlign: "center", fontSize: 10, color: arr.color, letterSpacing: "0.1em" }}>
          {arr.label}
        </div>
      ))}

      <div style={{ background: "#0a0a12", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 14, padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: 18, marginBottom: 6 }}>☁</div>
        <div style={{ fontSize: 10, color: "#00e676", letterSpacing: "0.18em", fontWeight: 700 }}>THINGSPEAK CLOUD</div>
        <div style={{ fontSize: 9, color: "#3a3a5a", marginTop: 4 }}>Dashboard + Analytics + MATLAB Visualizations</div>
      </div>

      <div style={{ background: "#0a0a12", border: "1px solid #14141e", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 8, color: "#3a3a5a", letterSpacing: "0.2em", marginBottom: 10 }}>TINYML AUDIO CLASSIFICATION</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🚨", label: "emergency", color: "#ff1744" },
            { icon: "🗣", label: "human", color: "#ffd600" },
            { icon: "🚗", label: "traffic", color: "#ff9100" },
            { icon: "🔇", label: "silent", color: "#4a4a6a" },
          ].map((c) => (
            <span key={c.label} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, background: `${c.color}16`, color: c.color, border: `1px solid ${c.color}28` }}>
              {c.icon} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
