import { useState, useEffect, useRef, useCallback } from "react";
import PerspectiveRoad from "../components/PerspectiveRoad";
import DistancePanel from "../components/DistancePanel";
import AudioClassifier from "../components/AudioClassifier";
import SystemStatus from "../components/SystemStatus";
import ArchitectureDiagram from "../components/ArchitectureDiagram";
import SensorLog from "../components/SensorLog";
import GPSMiniMap from "../components/GPSMiniMap";

type Tab = "dashboard" | "architecture" | "logs";

type AudioClass = "emergency" | "human" | "traffic" | "silent";

type LogEntry = {
  id: number;
  ts: string;
  type: "alert" | "info" | "warn";
  msg: string;
};

function generateLog(id: number, leftDist: number, rightDist: number, emergency: boolean): LogEntry | null {
  const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
  if (emergency) {
    return { id, ts, type: "alert", msg: "🚨 Emergency vehicle detected — audio class: EMERGENCY" };
  }
  if (leftDist < 50 && leftDist > 0) {
    return { id, ts, type: "warn", msg: `⚠ Left blind spot: object at ${leftDist} cm` };
  }
  if (rightDist < 50 && rightDist > 0) {
    return { id, ts, type: "warn", msg: `⚠ Right blind spot: object at ${rightDist} cm` };
  }
  const infos = [
    "ESP-NOW packet received — latency 4ms",
    "ThingSpeak channel updated — field1/field2",
    `GPS fix: 3D, sats=9, HDOP=1.2`,
    "FreeRTOS task: sensorTask heartbeat OK",
    `Audio inference: silent (conf 97%)`,
    "Ultrasonic L+R scan complete",
  ];
  if (Math.random() < 0.4) {
    return { id, ts, type: "info", msg: infos[Math.floor(Math.random() * infos.length)] };
  }
  return null;
}

export default function EchoLensDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [leftDist, setLeftDist] = useState(120);
  const [rightDist, setRightDist] = useState(95);
  const [emergency, setEmergency] = useState(false);
  const [blinkOn, setBlinkOn] = useState(false);
  const [tick, setTick] = useState(0);
  const [audioClass, setAudioClass] = useState<AudioClass>("silent");
  const [audioConf, setAudioConf] = useState(97);
  const [speed, setSpeed] = useState(42);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logId, setLogId] = useState(0);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const autoSimRef = useRef(autoSimulate);
  autoSimRef.current = autoSimulate;

  const leftAlert = leftDist > 0 && leftDist < 50;
  const rightAlert = rightDist > 0 && rightDist < 50;

  useEffect(() => {
    const iv = setInterval(() => {
      setBlinkOn((b) => !b);
      setTick((t) => t + 1);
    }, 400);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setLogId((id) => {
        const newId = id + 1;
        const entry = generateLog(newId, leftDist, rightDist, emergency);
        if (entry) {
          setLogs((prev) => [entry, ...prev].slice(0, 80));
        }
        return newId;
      });
    }, 1200);
    return () => clearInterval(iv);
  }, [leftDist, rightDist, emergency]);

  useEffect(() => {
    if (!autoSimulate) return;
    const iv = setInterval(() => {
      setLeftDist((v) => {
        const next = v + (Math.random() - 0.48) * 12;
        return Math.max(10, Math.min(200, Math.round(next)));
      });
      setRightDist((v) => {
        const next = v + (Math.random() - 0.48) * 12;
        return Math.max(10, Math.min(200, Math.round(next)));
      });
      setSpeed((v) => {
        const next = v + (Math.random() - 0.5) * 4;
        return Math.max(0, Math.min(120, Math.round(next)));
      });
    }, 600);
    return () => clearInterval(iv);
  }, [autoSimulate]);

  useEffect(() => {
    if (emergency) {
      setAudioClass("emergency");
      setAudioConf(Math.round(91 + Math.random() * 8));
    } else if (leftAlert || rightAlert) {
      setAudioClass("traffic");
      setAudioConf(Math.round(78 + Math.random() * 15));
    } else {
      const classes: AudioClass[] = ["silent", "human", "traffic", "silent", "silent"];
      setAudioClass(classes[Math.floor(Math.random() * classes.length)]);
      setAudioConf(Math.round(72 + Math.random() * 25));
    }
  }, [tick, emergency, leftAlert, rightAlert]);

  const handleEmergency = useCallback(() => {
    setEmergency((e) => !e);
  }, []);

  return (
    <div className="scanline min-h-screen bg-[#080810] text-[#e0e0e8] overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e2e] bg-[#080810]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/40 flex items-center justify-center text-sm">
                👂
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00e676] border-2 border-[#080810] animate-pulse" />
            </div>
            <div>
              <div
                className="text-[#00e5ff] font-bold tracking-[0.35em] text-lg leading-none"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                ECHOLENS
              </div>
              <div className="text-[10px] text-[#4a4a6a] tracking-[0.2em] mt-0.5">
                HEARING-ASSISTIVE DRIVING KIT
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Speed readout */}
            <div className="hidden sm:flex items-center gap-2 bg-[#0e0e1a] border border-[#1e1e2e] rounded-lg px-3 py-1.5">
              <span className="text-[10px] text-[#4a4a6a] tracking-widest">SPEED</span>
              <span
                className="text-[#00e5ff] text-xl font-bold tabular-nums"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {speed}
              </span>
              <span className="text-[10px] text-[#4a4a6a]">km/h</span>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
              <span className="text-[10px] text-[#4a4a6a] tracking-widest">LIVE</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-0">
          {(["dashboard", "architecture", "logs"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border-b-2 transition-all ${
                tab === t
                  ? "border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/5"
                  : "border-transparent text-[#4a4a6a] hover:text-[#8a8a9a] hover:bg-white/[0.02]"
              }`}
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              {t === "dashboard" ? "Live Dashboard" : t === "architecture" ? "Architecture" : "Event Log"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">
        {tab === "dashboard" && (
          <div className="space-y-4">
            {/* Emergency banner */}
            {emergency && (
              <div
                className={`rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all ${
                  blinkOn
                    ? "border-[#ff1744] bg-[#ff1744]/15 shadow-[0_0_24px_rgba(255,23,68,0.4)]"
                    : "border-[#4a0000] bg-[#ff1744]/5"
                }`}
              >
                <span className="text-2xl">🚨</span>
                <div>
                  <div
                    className={`text-sm font-bold tracking-widest ${blinkOn ? "text-[#ff1744]" : "text-[#cc1133]"}`}
                    style={{ fontFamily: "'Orbitron', monospace" }}
                  >
                    EMERGENCY VEHICLE DETECTED
                  </div>
                  <div className="text-[11px] text-[#ff5252] mt-0.5">
                    TinyML audio classifier — EMERGENCY class • Pull over safely
                  </div>
                </div>
                <div className="ml-auto text-[11px] text-[#4a4a6a] tabular-nums">
                  conf {audioConf}%
                </div>
              </div>
            )}

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Road canvas — takes 2/3 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[11px] text-[#4a4a6a] tracking-[0.2em]"
                      style={{ fontFamily: "'Orbitron', monospace" }}
                    >
                      BIRD'S-EYE VIEW — ILI9341 TFT RENDER
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
                      <span className="text-[10px] text-[#00e5ff]">60 FPS</span>
                    </div>
                  </div>
                  <PerspectiveRoad
                    leftDist={leftDist}
                    rightDist={rightDist}
                    emergency={emergency}
                    blinkOn={blinkOn}
                    tick={tick}
                  />
                </div>

                {/* Distance panels */}
                <div className="grid grid-cols-2 gap-3">
                  <DistancePanel
                    label="LEFT SENSOR"
                    sublabel="HC-SR04 ultrasonic"
                    value={leftDist}
                    alert={leftAlert}
                    blinkOn={blinkOn}
                    side="left"
                  />
                  <DistancePanel
                    label="RIGHT SENSOR"
                    sublabel="HC-SR04 ultrasonic"
                    value={rightDist}
                    alert={rightAlert}
                    blinkOn={blinkOn}
                    side="right"
                  />
                </div>

                {/* Audio classifier */}
                <AudioClassifier audioClass={audioClass} confidence={audioConf} blinkOn={blinkOn} />
              </div>

              {/* Right sidebar */}
              <div className="space-y-4">
                {/* System status */}
                <SystemStatus emergency={emergency} />

                {/* GPS minimap */}
                <GPSMiniMap tick={tick} speed={speed} />

                {/* Simulation controls */}
                <div className="bg-[#0c0c18] border border-[#1e1e2e] rounded-xl p-4">
                  <div
                    className="text-[11px] text-[#4a4a6a] tracking-[0.2em] mb-4"
                    style={{ fontFamily: "'Orbitron', monospace" }}
                  >
                    SIMULATION CONTROLS
                  </div>

                  <div className="space-y-4">
                    <SliderControl
                      label="Left Sensor"
                      value={leftDist}
                      onChange={setLeftDist}
                      alert={leftAlert}
                    />
                    <SliderControl
                      label="Right Sensor"
                      value={rightDist}
                      onChange={setRightDist}
                      alert={rightAlert}
                    />
                    <SliderControl
                      label="Speed"
                      value={speed}
                      onChange={setSpeed}
                      max={120}
                      unit="km/h"
                      alert={false}
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleEmergency}
                      className={`w-full py-2.5 px-4 rounded-lg border-2 text-[11px] font-bold tracking-widest transition-all ${
                        emergency
                          ? "border-[#ff1744] bg-[#ff1744]/20 text-[#ff1744] shadow-[0_0_16px_rgba(255,23,68,0.3)]"
                          : "border-[#2a2a3a] bg-[#12121e] text-[#4a4a6a] hover:border-[#ff1744]/50 hover:text-[#ff5252]"
                      }`}
                      style={{ fontFamily: "'Orbitron', monospace" }}
                    >
                      {emergency ? "⬛ STOP EMERGENCY" : "🚑 TRIGGER EMERGENCY"}
                    </button>

                    <button
                      onClick={() => setAutoSimulate((a) => !a)}
                      className={`w-full py-2 px-4 rounded-lg border text-[11px] tracking-widest transition-all ${
                        autoSimulate
                          ? "border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff]"
                          : "border-[#1e1e2e] bg-transparent text-[#4a4a6a] hover:text-[#8a8a9a]"
                      }`}
                      style={{ fontFamily: "'Orbitron', monospace" }}
                    >
                      {autoSimulate ? "⏹ STOP AUTO-SIM" : "▶ AUTO SIMULATE"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "architecture" && <ArchitectureDiagram />}
        {tab === "logs" && <SensorLog logs={logs} />}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-4 mt-2 border-t border-[#1e1e2e]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#2e2e4a] tracking-widest">
          <span style={{ fontFamily: "'Orbitron', monospace" }}>ECHOLENS © 2026</span>
          <span>ESP32 + Edge Impulse TinyML + ThingSpeak IoT + FreeRTOS</span>
        </div>
      </footer>
    </div>
  );
}

function SliderControl({
  label,
  value,
  onChange,
  alert,
  max = 200,
  unit = "cm",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  alert: boolean;
  max?: number;
  unit?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] text-[#4a4a6a]">{label}</span>
        <span
          className={`text-[13px] font-bold tabular-nums ${alert ? "text-[#ff1744]" : "text-[#00e676]"}`}
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          {value} <span className="text-[10px] font-normal text-[#4a4a6a]">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={unit === "km/h" ? 0 : 5}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          accentColor: alert ? "#ff1744" : "#00e5ff",
          background: `linear-gradient(to right, ${alert ? "#ff1744" : "#00e5ff"} ${(value / max) * 100}%, #1e1e2e ${(value / max) * 100}%)`,
        }}
      />
    </div>
  );
}
