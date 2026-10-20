# 🌊 Open Sea 1.2.6：浮层可读性与插件安装指引

## 推荐安装：官方客户端插件

Windows / Mac：打开侧栏 **「插件 → 添加插件」**，填写：

```text
open-sea-skin@1.2.6
```

安装后启用，按客户端提示重启。大陆镜像可能有同步延迟，找不到此版本时切换官方 npm 源。已有旧版时先在插件页卸载旧版再添加；不要删除整个配置、会话目录或锁文件。

[中文详细步骤](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/install.zh.md) · [官网效果](https://d-dev0101.github.io/open-sea-skin/)

## 修复了什么

- 插件广场使用的浮层底色不再跟随工作区一起降到低不透明度。
- 独立的第二层配置弹窗使用可读底色，不再只保护设置主弹窗。
- 工作区仍可保持 40% 玻璃，遮罩和弹窗层级不变。
- 中文安装介绍明确：Harness 插件优先，社区市场可选，浏览器扩展不是桌面端安装的前置步骤。

感谢 #16 提供复现信息。Logo、海面渲染和音效行为均未改变。

## 测试边界

通过构建检查、18 项 Node 测试、扩展/静态安装回归、社区桌面 24 组组合、官方桌面外壳浅深色及 40% / 90% 浮层回归、官网交互与加载降级测试。已核对官方 0.2.1-rc.2 的安装文档和 Modal 结构；这不是 Windows 原生安装或最新版完整实机兼容认证。#16 保留开放，等待实际客户端复验；性能建议仍在跟进。

## English

Prefer the npm spec `open-sea-skin@1.2.6` in Official Desktop's **Plugins → Add plugin**. This patch separates overlay/dialog readability from workspace opacity, including independently portalled plugin configuration dialogs. No logo, ocean-rendering or audio changes. Browser fixtures cover macOS/Windows shell structures, not native Windows E2E. Registry and GitHub install tarballs are checked for byte equality during publication.
