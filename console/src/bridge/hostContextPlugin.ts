import { hostBridge } from "./hostBridge";

const PLUGIN_ID = "business-host-context";

let installed = false;

export function installHostContextPlugin() {
  if (installed) return;

  const chat = window.QwenPaw?.chat;

  if (!chat?.requestPayload?.add) {
    console.warn("[HostContext] QwenPaw Chat SDK 尚未初始化");
    return;
  }

  chat.requestPayload.add(
    PLUGIN_ID,
    ({ payload }) => {
  console.log("[HostContext] 请求转换器开始执行");

  const context = hostBridge.getCurrentContext();

  console.log("[HostContext] 当前页面上下文:", context);

  console.log("[HostContext] 原始 input:", payload.input);

  if (!context) {
    console.warn("[HostContext] 没有获取到馆事通页面上下文");
    return payload;
  }

      // 没有馆事通上下文，不修改请求
      if (!context) {
        return payload;
      }

      const input = payload.input;

      if (!Array.isArray(input)) {
        return payload;
      }

      const pageInfo = [
        "[当前业务页面上下文]",
        `系统：${String(context.system || "").slice(0, 50)}`,
        `页面：${String(context.pageTitle || "未知").slice(0, 100)}`,
        `路由：${String(context.route || "").slice(0, 300)}`,
        "[/当前业务页面上下文]",
      ].join("\n");

      const nextInput = [...input];

      // 找到最后一条用户消息
      for (let i = nextInput.length - 1; i >= 0; i--) {
        const message = nextInput[i];

        if (
          !message ||
          typeof message !== "object" ||
          message.role !== "user"
        ) {
          continue;
        }

        // 情况一：content 是字符串
        if (typeof message.content === "string") {
          nextInput[i] = {
            ...message,
            content: `${pageInfo}\n\n${message.content}`,
          };

          break;
        }

        // 情况二：content 是数组（你的 QwenPaw 使用这种格式）
        if (Array.isArray(message.content)) {
          nextInput[i] = {
            ...message,
            content: [
              {
                type: "text",
                text: pageInfo,
              },
              ...message.content,
            ],
          };

          break;
        }
      }

      console.log("[HostContext] 已注入页面上下文:", {
        system: context.system,
        pageTitle: context.pageTitle,
        route: context.route,
      });

      return {
        ...payload,
        input: nextInput,
      };
    },
    {
      id: "host-page-context",
      order: 100,
    },
  );

  installed = true;

  console.log("[HostContext] 页面上下文插件已注册");
}