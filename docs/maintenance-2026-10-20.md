# 2026-10-20 维护记录

## 安装渠道观察

- [npm 公开下载 API](https://api.npmjs.org/downloads/point/2026-10-12:2026-10-18/open-sea-skin)：2026-10-12 至 10-18 共 1,223 次下载。
- [GitHub 1.2.5 Release](https://github.com/d-dev0101/open-sea-skin/releases/tag/v1.2.5)：核对时通用插件包 442 次、版本化插件包 7 次、扩展 ZIP 28 次下载。
- 两者时间范围不同，可能包含 CI、重复下载、镜像抓取，不代表安装人数，也无法分辨官方 Desktop / Web / 第三方市场的精确占比。没有加入用户遥测。
- 因此将「Harness 插件」作为推荐路径，而不宣称已测得多数用户使用官方桌面端。

## 反馈与修复

- 无开放 PR。#16 有新的 Windows 11 / 官方 Desktop 0.2.0-rc.2 / Open Sea 1.2.5 复现报告。
- 新增 overlay-token 广场与独立 body portal 配置弹窗测试，在修改前失败，修改后通过。
- 浮层 token 与语义 dialog / alertdialog 保持可读底色，工作区依旧按 40%–90% 设置；不改遮罩、Logo、渲染效果，不新增声音。
- 覆盖 macOS / Windows 外壳结构、浅深色、40% / 90% 组合。浏览器 fixture 不是 Windows 原生安装实测。
- 核对 [官方 0.2.1-rc.2 安装说明](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.2/packages/client/ui-plugin-manager/README.zh.md)及 Modal 的 role / 底色实现；尚非该版本完整实机兼容认证。

## 保留事项

性能问题仍需具体硬件与场景数据；用户提到的独立透明度滑杆和音频属于新增功能，本次未加入。未因 fixture 通过就关闭 #16，仍需用户复验。
