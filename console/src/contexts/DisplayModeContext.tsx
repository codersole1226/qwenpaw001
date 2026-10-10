import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

interface DisplayModeContextValue {
  isEmbedded: boolean;
}

const DisplayModeContext = createContext<DisplayModeContextValue>({
  isEmbedded: false,
});

function detectEmbeddedMode(): boolean {
  // 独立打开 QwenPaw，不限制功能
  if (window.parent === window) {
    return false;
  }

  // 只有携带嵌入标识的 iframe 才进入受限模式
  const params = new URLSearchParams(window.location.search);

  return params.get("displayMode") === "embedded";
}

export function DisplayModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isEmbedded = useMemo(() => detectEmbeddedMode(), []);

  return (
    <DisplayModeContext.Provider value={{ isEmbedded }}>
      {children}
    </DisplayModeContext.Provider>
  );
}

export function useDisplayMode() {
  return useContext(DisplayModeContext);
}