import { useEffect, useCallback, useMemo } from "react";
import type { FC } from "react";
import "./App.scss";
import { FloatingHeader } from "./components/FloatingHeader";
import { ApiTester } from "./features/api-tester";
import { SourceTracePanel } from "./features";
import { useFloatingStore, type ActiveFeature } from "./store/floatingStore";

const FEATURE_COMPONENTS: Record<ActiveFeature, FC> = {
  "api-tester": ApiTester,
  "source-trace": SourceTracePanel,
};

const FEATURE_LABELS: Record<ActiveFeature, string> = {
  "api-tester": "API 테스터",
  "source-trace": "소스 추적",
};

function App() {
  const { isVisible, activeFeature, setVisible, setActiveFeature, toggle } =
    useFloatingStore();

  useEffect(() => {
    function handleGlobalToggle(): void {
      toggle();
    }

    window.addEventListener("devfloat-toggle", handleGlobalToggle);
    return () =>
      window.removeEventListener("devfloat-toggle", handleGlobalToggle);
  }, [toggle]);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const FeatureComponent = useMemo(
    () => FEATURE_COMPONENTS[activeFeature],
    [activeFeature],
  );

  const tabs = useMemo(
    () =>
      (Object.keys(FEATURE_LABELS) as ActiveFeature[]).map((feature) => ({
        id: feature,
        label: FEATURE_LABELS[feature],
        isActive: activeFeature === feature,
      })),
    [activeFeature],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className="app">
      <FloatingHeader onClose={handleClose} />
      <nav className="app__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`app__tab ${tab.isActive ? "app__tab--active" : ""}`}
            onClick={() => setActiveFeature(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="app__main">
        <div className={`container--${activeFeature}`}>
          <FeatureComponent />
        </div>
      </main>
    </div>
  );
}

export default App;
