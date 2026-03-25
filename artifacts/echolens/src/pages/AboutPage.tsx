interface Props {
  onBack: () => void;
}

export default function AboutPage({ onBack }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060608",
        color: "#e0e0e8",
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
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, black 30%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "35%",
          background: "radial-gradient(ellipse at top, rgba(0,229,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
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
      </header>

      {/* Content */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 640,
          margin: "0 auto",
          padding: "48px 24px 64px",
        }}
      >
        {/* Page title */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 16px",
              borderRadius: 999,
              border: "1px solid rgba(0,229,255,0.3)",
              background: "rgba(0,229,255,0.06)",
              marginBottom: 20,
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
            <span style={{ fontSize: 9, color: "#00e5ff", letterSpacing: "0.22em", fontWeight: 600 }}>
              THE TEAM
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(32px, 7vw, 52px)",
              fontWeight: 900,
              letterSpacing: "0.08em",
              color: "#ffffff",
              textShadow: "0 2px 40px rgba(255,255,255,0.08)",
            }}
          >
            ABOUT{" "}
            <span
              style={{
                color: "#00e5ff",
                textShadow: "0 0 40px rgba(0,229,255,0.5)",
              }}
            >
              US
            </span>
          </h1>
        </div>

        {/* Who We Are */}
        <Card color="#00e5ff" label="WHO WE ARE">
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.85,
              color: "#b0b0cc",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 300,
              letterSpacing: "0.01em",
            }}
          >
            Emre Kiran and Efil Saylam. Third-year Computer Engineering students. We saw a problem
            that affects millions of people every day and decided to do something about it.
          </p>
        </Card>

        {/* Our Mission */}
        <Card color="#7c4dff" label="OUR MISSION">
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.85,
              color: "#b0b0cc",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 300,
              letterSpacing: "0.01em",
            }}
          >
            Hearing-impaired drivers deserve to know what is happening around them on the road. Our
            mission is to make that possible. We are building affordable, accessible technology that
            turns traffic sounds into visual information so every driver can drive independently and
            safely.
          </p>
        </Card>

        {/* LinkedIn buttons */}
        <Card color="#0a66c2" label="CONNECT WITH US">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <LinkedInButton name="Emre Kiran" url="https://www.linkedin.com/in/emrekirann/" />
            <LinkedInButton name="Efil Saylam" url="https://www.linkedin.com/in/efil-saylam/" />
          </div>
        </Card>
      </main>
    </div>
  );
}

function Card({ color, label, children }: { color: string; label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#0a0a12",
        border: `1.5px solid ${color}28`,
        borderRadius: 14,
        padding: "24px 24px 22px",
        marginBottom: 16,
        boxShadow: `0 0 32px ${color}0a, 0 2px 16px rgba(0,0,0,0.4)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 24,
          right: 24,
          height: 1,
          background: `linear-gradient(to right, transparent, ${color}55, transparent)`,
        }}
      />
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.25em",
          color: color,
          marginBottom: 14,
          opacity: 0.85,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function LinkedInButton({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(10,102,194,0.18)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,102,194,0.7)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 18px rgba(10,102,194,0.45)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(10,102,194,0.08)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,102,194,0.4)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 10px rgba(10,102,194,0.2)";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        borderRadius: 10,
        border: "1.5px solid rgba(10,102,194,0.4)",
        background: "rgba(10,102,194,0.08)",
        color: "#5ba4f5",
        cursor: "pointer",
        fontFamily: "'Orbitron', monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        boxShadow: "0 0 10px rgba(10,102,194,0.2)",
        textDecoration: "none",
        transition: "all 0.18s ease",
      }}
    >
      {/* LinkedIn icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      {name}
      <span style={{ marginLeft: "auto", fontSize: 9, color: "#3a5a8a", letterSpacing: "0.1em" }}>
        ↗ LINKEDIN
      </span>
    </a>
  );
}
