const BRIDGE_CHANNEL = "QWENPAW_HOST_BRIDGE";
const BRIDGE_VERSION = 1;

export interface HostPageContext {
  system: string;
  route: string;
  pageTitle?: string;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

interface BridgeMessage {
  channel: string;
  version: number;
  type: string;
  payload?: unknown;
}

type ContextListener = (context: HostPageContext) => void;

class HostBridge {
  private initialized = false;

  private hostOrigin: string | null = null;

  private currentContext: HostPageContext | null = null;

  private contextListeners = new Set<ContextListener>();

  /**
   * 初始化通信
   */
/**
 * 初始化通信
 */
init() {
  if (this.initialized) {
    return;
  }

  // 1. 判断是否运行在馆事通 iframe 中
  const params = new URLSearchParams(window.location.search);

  const isEmbedded =
    window.self !== window.top &&
    params.get("displayMode") === "embedded";

  console.log("[HostBridge] 初始化检查：", {
    href: window.location.href,
    isIframe: window.self !== window.top,
    displayMode: params.get("displayMode"),
    isEmbedded,
  });

  if (!isEmbedded) {
    console.warn("[HostBridge] 未满足嵌入模式条件，跳过初始化");
    return;
  }

  // 2. 获取馆事通的 Origin
  const configuredOrigin = import.meta.env.VITE_HOST_ORIGIN;

  console.log("[HostBridge] HOST_ORIGIN 配置检查：", {
    configuredOrigin,
  });

  if (!configuredOrigin) {
    console.warn("[HostBridge] 未配置 VITE_HOST_ORIGIN，通信未启动");
    return;
  }

  try {
    this.hostOrigin = new URL(configuredOrigin).origin;
  } catch {
    console.error("[HostBridge] VITE_HOST_ORIGIN 配置不合法");
    return;
  }

  // 3. 注册消息监听
  window.addEventListener("message", this.handleMessage);

  this.initialized = true;

  // 4. 主动通知馆事通：QwenPaw 已准备就绪
  this.send("AI_READY", {});

  console.log("[HostBridge] 已启动，等待馆事通连接");
}

  /**
   * 接收馆事通发送的消息
   */
  private handleMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) {
      return;
    }

    if (event.origin !== this.hostOrigin) {
      return;
    }

    const message = event.data as BridgeMessage;

    if (
      !message ||
      message.channel !== BRIDGE_CHANNEL ||
      message.version !== BRIDGE_VERSION
    ) {
      return;
    }

    switch (message.type) {
      case "HOST_CONTEXT":
      case "HOST_ROUTE_CHANGED": {
        const context = message.payload as HostPageContext;

        if (
          !context ||
          typeof context.system !== "string" ||
          typeof context.route !== "string"
        ) {
          return;
        }

        this.currentContext = context;

        console.log("[HostBridge] 收到页面信息：", context);

        this.contextListeners.forEach((listener) => {
          listener(context);
        });

        break;
      }

      default:
        break;
    }
  };

  /**
   * 向馆事通发送消息
   */
  send(type: string, payload: unknown = {}) {
    if (!this.initialized || !this.hostOrigin) {
      return;
    }

    window.parent.postMessage(
      {
        channel: BRIDGE_CHANNEL,
        version: BRIDGE_VERSION,
        type,
        payload,
      },
      this.hostOrigin
    );
  }

  /**
   * 主动请求当前页面信息
   */
  requestContext() {
    this.send("AI_REQUEST_CONTEXT");
  }

  /**
   * 获取当前页面上下文
   */
  getCurrentContext() {
    return this.currentContext;
  }

  /**
   * 订阅页面上下文变化
   */
  subscribeContext(listener: ContextListener) {
    this.contextListeners.add(listener);

    if (this.currentContext) {
      listener(this.currentContext);
    }

    return () => {
      this.contextListeners.delete(listener);
    };
  }

  /**
   * 销毁
   */
  destroy() {
    window.removeEventListener("message", this.handleMessage);

    this.contextListeners.clear();
    this.currentContext = null;
    this.hostOrigin = null;
    this.initialized = false;
  }
}

export const hostBridge = new HostBridge();