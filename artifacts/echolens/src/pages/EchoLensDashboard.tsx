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
  const [activeAlert, setActiveAlert] = useState<"ambulance" | "horn" | null>(null);
  const [blinkOn, setBlinkOn] = useState(false);
  const [tick, setTick] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setScrollPct(total > 0 ? Math.min(1, scrolled / total) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    setActiveAlert(null);
    setLeftDist(120);
    setRightDist(95);
  }, []);

  const triggerEmergency = useCallback(() => {
    setActiveAlert((prev) => {
      if (prev === "ambulance") return null;
      if (prev !== null) return prev;
      return "ambulance";
    });
  }, []);

  const triggerHorn = useCallback(() => {
    setActiveAlert((prev) => {
      if (prev === "horn") return null;
      if (prev !== null) return prev;
      return "horn";
    });
  }, []);

  const emergency = activeAlert === "ambulance";
  const hornDetected = activeAlert === "horn";

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
              borderRadius: 8,
              border: "1.5px solid rgba(0,229,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,229,255,0.06)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5C8 1.5 2 5 2 9.5C2 12.5 4.7 14.5 8 14.5C11.3 14.5 14 12.5 14 9.5C14 5 8 1.5 8 1.5Z"
                stroke="#00e5ff"
                strokeWidth="1.2"
                fill="none"
              />
              <circle cx="8" cy="9" r="2" fill="#00e5ff" opacity="0.8" />
            </svg>
          </div>
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
            ECHOVISION
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onBack && (
            <button
              onClick={onBack}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 14px rgba(255,214,0,0.55), 0 0 4px rgba(255,214,0,0.3)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,214,0,0.75)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ffe033";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 8px rgba(255,214,0,0.3), 0 0 2px rgba(255,214,0,0.15)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,214,0,0.5)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ffd600";
              }}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: "1px solid rgba(255,214,0,0.5)",
                background: "rgba(255,214,0,0.07)",
                color: "#ffd600",
                cursor: "pointer",
                fontFamily: "'Orbitron', monospace",
                fontSize: 8,
                letterSpacing: "0.18em",
                boxShadow: "0 0 8px rgba(255,214,0,0.3), 0 0 2px rgba(255,214,0,0.15)",
                transition: "all 0.18s ease",
              }}
            >
              ← HOME
            </button>
          )}
        </div>
      </header>

      {/* ── TABS ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", borderBottom: "1px solid #14141e" }}>
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
            className="btn-ctrl"
            onClick={triggerEmergency}
            disabled={activeAlert === "horn"}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 9,
              border: `1.5px solid ${emergency ? "#2979ffcc" : "#2979ff59"}`,
              background: emergency ? "#2979ff22" : "#2979ff12",
              color: "#2979ff",
              cursor: activeAlert === "horn" ? "not-allowed" : "pointer",
              fontFamily: "'Orbitron', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.18em",
              boxShadow: emergency ? "0 0 18px #2979ff55" : "0 0 10px #2979ff18",
              marginBottom: 20,
              opacity: activeAlert === "horn" ? 0.35 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {emergency ? "⬛ STOP EMERGENCY" : "🚑 TRIGGER EMERGENCY ALERT"}
          </button>

          <button
            className="btn-ctrl"
            onClick={triggerHorn}
            disabled={activeAlert === "ambulance"}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 9,
              border: `1.5px solid ${hornDetected ? "#ffd600cc" : "#ffd60059"}`,
              background: hornDetected ? "#ffd60022" : "#ffd60012",
              color: "#ffd600",
              cursor: activeAlert === "ambulance" ? "not-allowed" : "pointer",
              fontFamily: "'Orbitron', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.18em",
              boxShadow: hornDetected ? "0 0 18px #ffd60055" : "0 0 10px #ffd60018",
              marginBottom: 20,
              opacity: activeAlert === "ambulance" ? 0.35 : 1,
              transition: "opacity 0.2s",
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

          {/* ── RADAR / AUDIO SEPARATOR ──────────────────────────────────────── */}
          <div
            style={{
              margin: "18px 0 16px",
              height: 1,
              background: "linear-gradient(to right, transparent, rgba(0,229,255,0.35), rgba(41,121,255,0.25), transparent)",
              boxShadow: "0 0 6px rgba(0,229,255,0.18)",
              borderRadius: 1,
            }}
          />

          {/* ── AI AUDIO CLASSIFIER ──────────────────────────────────────────── */}
          <AudioClassifier classification={audioClassification} />
        </main>
      ) : (
        <main style={{ maxWidth: 680, margin: "0 auto", padding: "16px 14px 32px" }}>
          <ArchTab />
        </main>
      )}

      {/* ── SCROLL PROGRESS BAR ──────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 8,
          width: 4,
          height: "100vh",
          background: "rgba(0,229,255,0.06)",
          borderRadius: 2,
          zIndex: 300,
          pointerEvents: "none",
        }}
      >
        {/* Filled portion */}
        <div
          style={{
            width: "100%",
            height: `${scrollPct * 100}%`,
            borderRadius: 2,
            background: "linear-gradient(to bottom, #00e5ff, #2979ff)",
            boxShadow: "0 0 6px rgba(0,229,255,0.55), 0 0 12px rgba(0,229,255,0.20)",
            transition: "height 0.1s linear",
          }}
        />
        {/* Glowing dot at current position */}
        <div
          style={{
            position: "absolute",
            top: `calc(${scrollPct * 100}% - 5px)`,
            left: "50%",
            transform: "translateX(-50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#00e5ff",
            boxShadow: "0 0 8px rgba(0,229,255,0.9), 0 0 16px rgba(0,229,255,0.45)",
            transition: "top 0.1s linear",
          }}
        />
      </div>

      {/* ── HORN BOTTOM GLOW ─────────────────────────────────────────────────── */}
      {hornDetected && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 90,
            background: "linear-gradient(to top, rgba(255,214,0,0.28) 0%, rgba(255,214,0,0.10) 45%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 200,
            animation: "hornPulse 1.6s ease-in-out infinite",
          }}
        />
      )}

      <style>{`
        @keyframes pulse       { 0%,100%{opacity:1}    50%{opacity:0.4} }
        @keyframes hornPulse   { 0%,100%{opacity:0.55} 50%{opacity:1}   }
        @keyframes listenPulse { 0%,100%{opacity:0.65} 50%{opacity:1}   }

        .btn-ctrl { transition: filter 0.18s ease, box-shadow 0.18s ease; }
        .btn-ctrl:hover  { filter: brightness(1.35); }
        .btn-ctrl:active { filter: brightness(0.72); }
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
      className="btn-ctrl"
      onClick={onClick}
      style={{
        padding: "11px 6px",
        borderRadius: 9,
        border: `1.5px solid ${active ? `${color}cc` : isReset ? "rgba(0,229,255,0.38)" : `${color}59`}`,
        background: active ? `${color}22` : isReset ? "rgba(0,229,255,0.07)" : `${color}12`,
        color: isReset ? "#00e5ff" : color,
        cursor: "pointer",
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        boxShadow: active ? `0 0 18px ${color}55` : `0 0 10px ${color}18`,
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
            { icon: "🎤", label: "PDM Mic" },
            { icon: "📡", label: "Ultrasonic" },
            { icon: "🛰", label: "GPS NEO-6M" },
            { icon: "🔊", label: "Buzzer" },
          ],
        },
        {
          title: "KART 2 — DISPLAY UNIT (ESP32)",
          color: "#00e5ff",
          items: [
            { icon: "🖥", label: "TFT Display" },
            { icon: "📶", label: "WiFi" },
            { icon: "⚡", label: "FreeRTOS" },
            { icon: "🔔", label: "Alerts" },
          ],
        },
      ].map((section) => (
        <div key={section.title} style={{ background: "#0a0a12", border: "1px solid #14141e", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 10, color: section.color, letterSpacing: "0.18em", marginBottom: 12, fontWeight: 700 }}>
            {section.title}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {section.items.map((item) => (
              <div key={item.label} style={{ ...box(section.color), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 12px" }}>
                <div style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</div>
                <div style={{ fontWeight: 600 }}>{item.label}</div>
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
