import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface DisplayModeContextValue {
  isEmbedded: boolean;
}

const DisplayModeContext = createContext<DisplayModeContextValue>({
  isEmbedded: false,
});

function detectEmbeddedMode(): boolean {
  // 独立访问 QwenPaw
  if (window.self === window.top) {
    return false;
  }

  // 馆事通 iframe 嵌入
  const params = new URLSearchParams(window.location.search);

  return params.get("displayMode") === "embedded";
}

export function DisplayModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isEmbedded = detectEmbeddedMode();
  console.log("[QwenPaw] isEmbedded:", isEmbedded);

  return (
    <DisplayModeContext.Provider value={{ isEmbedded }}>
      {children}
    </DisplayModeContext.Provider>
  );
}

export function useDisplayMode() {
  return useContext(DisplayModeContext);
}