/**
 * 馆事通 AI 助手功能配置
 *
 * 只影响嵌入模式。
 * 独立访问 QwenPaw 不受限制。
 */

export const embeddedFeatures = {
  /**
   * 左侧导航允许显示的菜单 ID
   *
   * 后续根据 QwenPaw 实际菜单 ID 调整。
   */
  allowedSidebarMenuIds: [
    "core.chat",
    "core.inbox",
  ],

  /**
   * 底部快捷设置允许显示的功能
   */
  settings: {
    theme: true,
    language: true,
    account: false,
    model: false,
    agent: false,
    skills: false,
    plugins: false,
    restart: false,
  },
};