import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import EchoLensDashboard from "./pages/EchoLensDashboard";
import AboutPage from "./pages/AboutPage";

type Screen = "landing" | "dashboard" | "architecture" | "about";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");

  if (screen === "landing") {
    return (
      <LandingPage
        onTryDemo={() => setScreen("dashboard")}
        onViewTech={() => setScreen("architecture")}
        onAbout={() => setScreen("about")}
      />
    );
  }

  if (screen === "about") {
    return <AboutPage onBack={() => setScreen("landing")} />;
  }

  return (
    <EchoLensDashboard
      initialTab={screen === "architecture" ? "architecture" : "dashboard"}
      onBack={() => setScreen("landing")}
    />
  );
}
