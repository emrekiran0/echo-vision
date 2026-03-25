interface Props {
  onTryDemo: () => void;
  onViewTech: () => void;
  onAbout: () => void;
}

export default function LandingPage({ onTryDemo, onViewTech, onAbout }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060608",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Orbitron', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 80%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 80%, black 30%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "40%",
          background: "radial-gradient(ellipse at bottom, rgba(0,229,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Nav */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
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
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#e0e0f0",
            letterSpacing: "0.12em",
          }}
        >
          ECHOVISION
          <span style={{ color: "#00e5ff", marginLeft: 1 }}>.</span>
          <span style={{ fontSize: 11, color: "#4a4a6a", marginLeft: 4, fontWeight: 400 }}>AI</span>
        </span>
      </nav>

      {/* Hero content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px 80px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 16px",
            borderRadius: 999,
            border: "1px solid rgba(0,229,255,0.3)",
            background: "rgba(0,229,255,0.06)",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00e5ff",
              boxShadow: "0 0 6px #00e5ff",
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: "#00e5ff",
              letterSpacing: "0.22em",
              fontWeight: 600,
            }}
          >
            NEXT-GEN ROAD SAFETY
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            margin: "0 0 8px",
            padding: 0,
            lineHeight: 1.0,
            fontWeight: 900,
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "clamp(48px, 9vw, 96px)",
              color: "#ffffff",
              letterSpacing: "0.04em",
              textShadow: "0 2px 40px rgba(255,255,255,0.1)",
            }}
          >
            HEAR THE
          </span>
          <span
            style={{
              display: "block",
              fontSize: "clamp(48px, 9vw, 96px)",
              color: "#00e5ff",
              letterSpacing: "0.04em",
              textShadow: "0 0 60px rgba(0,229,255,0.6), 0 0 120px rgba(0,229,255,0.3)",
            }}
          >
            UNSEEN.
          </span>
        </h1>

        {/* Description */}
        <p
          style={{
            marginTop: 32,
            marginBottom: 0,
            maxWidth: 540,
            fontSize: "clamp(14px, 2vw, 17px)",
            color: "#8a8aaa",
            lineHeight: 1.7,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 300,
            letterSpacing: "0.01em",
          }}
        >
          Deaf and hard-of-hearing drivers face critical risks when emergency vehicles
          approach from behind. Our AI-powered system provides{" "}
          <strong style={{ color: "#c0c0d8", fontWeight: 600 }}>instant visual alerts</strong>,
          closing the sensory gap.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 48,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onTryDemo}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "15px 32px",
              borderRadius: 10,
              border: "none",
              background: "#00e5ff",
              color: "#060608",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.18em",
              fontFamily: "'Orbitron', monospace",
              cursor: "pointer",
              boxShadow: "0 0 32px rgba(0,229,255,0.45), 0 4px 20px rgba(0,229,255,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 48px rgba(0,229,255,0.65), 0 4px 24px rgba(0,229,255,0.4)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 32px rgba(0,229,255,0.45), 0 4px 20px rgba(0,229,255,0.25)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: 15 }}>⚡</span>
            TRY DEMO
          </button>

          <button
            onClick={onViewTech}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "15px 32px",
              borderRadius: 10,
              border: "1.5px solid rgba(0,229,255,0.35)",
              background: "rgba(0,229,255,0.07)",
              color: "#00e5ff",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.18em",
              fontFamily: "'Orbitron', monospace",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,229,255,0.12)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,229,255,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,229,255,0.07)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,229,255,0.35)";
            }}
          >
            VIEW TECHNOLOGY
          </button>

          <button
            onClick={onAbout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "15px 32px",
              borderRadius: 10,
              border: "1.5px solid rgba(41,121,255,0.4)",
              background: "rgba(41,121,255,0.07)",
              color: "#5b9fff",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.18em",
              fontFamily: "'Orbitron', monospace",
              cursor: "pointer",
              boxShadow: "0 0 14px rgba(41,121,255,0.2)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(41,121,255,0.14)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(41,121,255,0.7)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(41,121,255,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(41,121,255,0.07)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(41,121,255,0.4)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 14px rgba(41,121,255,0.2)";
            }}
          >
            ABOUT US
          </button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 72,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { value: "<5ms", label: "ESP-NOW Latency" },
            { value: "4", label: "Audio Classes" },
            { value: "97%", label: "ML Accuracy" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "clamp(22px, 3.5vw, 32px)",
                  fontWeight: 900,
                  color: "#00e5ff",
                  textShadow: "0 0 20px rgba(0,229,255,0.5)",
                  letterSpacing: "0.06em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#3a3a5a",
                  letterSpacing: "0.2em",
                  marginTop: 4,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {stat.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
