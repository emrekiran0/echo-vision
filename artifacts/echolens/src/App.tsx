import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import EchoLensDashboard from "./pages/EchoLensDashboard";

type Screen = "landing" | "dashboard" | "architecture";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");

  if (screen === "landing") {
    return (
      <LandingPage
        onTryDemo={() => setScreen("dashboard")}
        onViewTech={() => setScreen("architecture")}
      />
    );
  }

  return (
    <EchoLensDashboard
      initialTab={screen === "architecture" ? "architecture" : "dashboard"}
      onBack={() => setScreen("landing")}
    />
  );
}
