# 🔎 兼容性记录 / Compatibility

最后核对：**2026-11-08**。本次 GitHub 修复版：**1.2.8**；npm / 中国大陆镜像的已验证版本仍为 **1.2.7**，发布状态见 [README](../README.md)。

## 官方 Harness 更新了吗？

更新了。本次查询 `@deepseek-ai/dsh` 的 `latest` 与 `next` 均为 **0.2.2-rc.1**；官方 macOS arm64 桌面更新源也指向该版本。它仍是预发布版本，本次没有将实验性的 alpha 通道当作日常兼容基线。

平台分发并非完全同步：11 月 8 日核对的 Windows x64 更新源同为 0.2.2-rc.1，macOS Intel x64 更新源仍为 0.2.1-rc.4。请以客户端显示的实际版本为准，较旧版本继续使用文档中的备用更新步骤。

- [官方 0.2.2-rc.1 发布记录](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-rc.1)（2026-11-04，提交 `66491b0`）
- [该版本插件管理说明](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.1/packages/client/ui-plugin-manager/README.zh.md)
- [npm 官方包元数据](https://registry.npmjs.org/@deepseek-ai%2fdsh/latest)

该版本支持更新从 npm registry 安装的第三方插件，并在热更新失败时回滚旧版本。本地 `.tgz`、Git 或 URL 安装不属于这一更新通道。安装指南已同步区分这两种情况。

## 2026-11-08 核查与修复

| 范围 | 方法与结论 |
| --- | --- |
| 现有 npm 版 1.2.7 | 下载官方 macOS arm64 0.2.2-rc.1 桌面包并核对 SHA-512；使用其中的 CLI/Host 和真实前端，在全新 `DSH_HOME` 的 `web` profile 中完成安装、WebGPU 加载、浅深色及 40%/90% 调节、卸载重启，以及图形化「添加插件 → 立即启用」。未操作日常配置。 |
| 新版官方更新入口 | 全新隔离环境先从 registry 安装 1.2.6；在真实插件详情页点击「更新到 1.2.7 → 更新」，收到「新版本已经开始运行」。核对 profile 与实际安装包均为 1.2.7，海洋重新加载成功。 |
| 最终 1.2.8 修复包 | 同一官方 rc.1 运行时另建全新 profile，使用待发布的确切 `.tgz` 重跑 CLI 安装、真实 Web 前端、12 组主题/平台属性/玻璃检查、卸载重启和图形安装启用，全部通过，无页面异常。 |
| 1.2.8 输入区修复 | 官方 fixture 加入真实 `[data-composer-seat]` sticky gradient，验证启用后只移除重复渐变，保留卡片圆角和其他插件背景；停用后恢复原渐变。macOS/Windows 结构 × 浅深色 × 40%/72%/90%，共 12 组通过。 |
| 社区桌面结构 | 原有 24 组布局/材质/明暗/玻璃组合通过。 |
| 渲染调度 | 用真实帧调度代码配合确定性时钟，验证低帧率模式降分辨率后可恢复、长时间隐藏不会污染恢复后的 FPS 采样、WebGL2 保留减少动态效果的 20 FPS/0.9 像素比预算。未把这些测试当作 Mac GPU/电池基准。 |

**边界：官方 macOS 包内 Host + 真实 Web 客户端的隔离测试，不等于本次重新完成原生 macOS Electron 窗口测试。Windows 平台属性和 DOM 布局模拟，也不等于原生 Windows 安装或标题栏验证。** 1.2.7 能安装并显示海洋，不表示新反馈的每处视觉问题都已解决。

### 本周 GitHub 反馈如何处理？

- **[#25 旧对话输入区黑边](https://github.com/d-dev0101/open-sea-skin/issues/25)：** 已复现并修复外层渐变重复叠色，纳入 1.2.8。
- **[#26 浅色面板白底白字](https://github.com/d-dev0101/open-sea-skin/issues/26)：** 报告使用 1.2.6；1.2.7 已排除皮肤面板被宿主 dialog 样式覆盖。建议先更新至已发布的 1.2.7，保留问题等待反馈。默认不透明度建议已记录，不自动改写用户已保存的值。
- **[#27 Windows 标题栏色块](https://github.com/d-dev0101/open-sea-skin/issues/27)：** 其输入区叠色与 #25 一起处理；原生窗口按钮底色仍待 Windows 实机验证。没有采用固定海洋 RGB 猜测或广泛覆盖所有子元素的方案。
- **[#28 Mac GPU 占用 / 节能模式](https://github.com/d-dev0101/open-sea-skin/issues/28)：** 已修复调度和预算中的可确定问题，但用户报告的 GPU 数值并非维护者复测结果。本版尚未新增节能档，不声称已解决发热或固定降低多少功耗。
- **[#29 天文 / 星空模块建议](https://github.com/d-dev0101/open-sea-skin/issues/29)：** 属于贡献提议，尚不是待合并 PR；本轮优先兼容性与能耗，未加入新特效或重写海洋。

下一轮优先考虑可独立选择的节能档及不同硬件实测；再精简新版插件详情页中的安装后帮助（当前会展开整篇 README）。保持动态海洋和现有视觉风格，避免把性能调节与波浪速度、系统减少动态效果混在一起。

## 2026-11-01 历史验证（1.2.7 / Harness 0.2.1-rc.5）

| 范围 | 方法与结论 |
| --- | --- |
| 官方 macOS 包内运行时 | 下载官方 rc.5 桌面包并核对 SHA-512；使用其中的 CLI、pnpm 与真实前端资源，在全新 `DSH_HOME` 安装插件、启动 Host、加载页面、卸载后重启。没有改动日常配置或会话。 |
| 官方桌面安装链路 | 另外创建全新 `desktop` profile，使用 rc.5 内置 pnpm **11.28.5** 安装本地 `.tgz`；真实 Desktop Host 启动后海洋资源 HTTP 200、WebGPU 就绪，卸载成功。未启动原生 Electron 窗口。 |
| 真实 Harness 页面 | Chromium 中运行 rc.5 的真实客户端，海洋 WebGPU 就绪；检查浅深色、40%/90% 玻璃、皮肤控制面板与聊天输入卡片。不是仅靠自制页面判断兼容。 |
| 官方桌面布局回归 | macOS / Windows DOM 结构 × 浅深色 × 40%/90%，共 8 组；覆盖侧栏内部填色、`main.conversation`、底部、主设置及独立弹窗。 |
| 社区桌面布局回归 | 保留 DSH Desktop Beta `2.0.5-beta.1` 的 24 组布局/材质/明暗/玻璃组合。 |
| 浏览器扩展与静态安装 | 验证识别 Harness、控制与保存、停用/卸载，以及普通 localhost 页面和已有新标签页不受影响。 |
| 海洋计算 | 800 个时空/浪高样本对比原公式；WebGPU 与 WebGL2 固定场景截图最大通道差 1/255，无 Shader 错误。未做 FPS 提速百分比承诺。 |

**边界：这次没有完成原生 Windows 桌面端安装，也没有把 Chromium 中的平台属性模拟称作原生 Mac/Windows 窗口测试。** 历史上已完成官方 macOS Desktop `0.2.0-rc.2` 的隔离安装与目视验证。原生源码集成的旧基线仍为 `0.1.2-alpha.3` / `dd6322d60`，与推荐的 npm 插件路径不同。

## 安装源核验（1.2.7，2026-11-01）

**1.2.7 已发布至 npm，中国大陆镜像也已同步。** 2026-11-01 发布后重新核验：

| 安装源 | 安装目标 | 核验结果 |
| --- | --- | --- |
| npm 官方源 `https://registry.npmjs.org/` | `open-sea-skin@1.2.7` | 元数据与下载 HTTP 200；全新目录、独立缓存安装成功 |
| 中国大陆镜像 `https://registry.npmmirror.com/` | `open-sea-skin@1.2.7` | 元数据与下载 HTTP 200；全新目录、独立缓存安装成功 |

两处 `latest` 均为 **1.2.7**，压缩包均为 **400,829 字节**，SHA-512 integrity 校验通过，并与 GitHub Release 的原始压缩包逐字节一致。SHA-256：`2da120caef2bd120a1ccee8d40929515339a8f0aada1124ea85084b6370ba586`。安装测试使用 `--ignore-scripts`，未修改日常 Harness 配置。

此前同日、发布前的记录是两处 `latest` 为 1.2.6、1.2.7 返回 404；该状态已由本次发布后核验更新。

真实 rc.5 Web 插件页还通过了「添加插件 → 本地 `.tgz` 完整路径 → 安装 → 立即启用 → 海洋加载」流程。自定义源是用户填写的 npm registry，不是第三个固定镜像；可用性取决于该源是否提供本包及其认证要求。[三个选项的填写方式](install.zh.md#三种安装源如何填写)

## 前次修复与其他跟进项

- ✅ **#16：** 修复浅色皮肤面板白底白字、Windows 内层侧栏叠色；适配 rc.5 聊天输入卡片、气泡、代码卡片的专属颜色变量。保留圆角、代码高亮与宿主弹窗的可读底色。
- ✅ **#20 / #21 部分建议：** 复用波浪法线/浪峰与视线计算。原 PR 已由作者关闭；只吸收经视觉回归的部分，未宣称整包合并。
- 🔎 **[#19 远景闪烁](https://github.com/d-dev0101/open-sea-skin/issues/19)：** 高频法线与窄高光存在混叠风险，仍需动态 A/B 与不同分辨率实测，本版未解决。
- 💡 **[#22 波浪速度](https://github.com/d-dev0101/open-sea-skin/issues/22)：** 已记录，后续需要连续相位计时与各安装路径设置同步，本版未新增。

界面适配继续优先使用语义 `data-*` 边界及官方颜色变量。旧版 hash 选择器只作为兼容回退，并不保证未来每次 Harness 改版自动兼容。

## 复跑验证

```sh
npm ci
npm run build
npm run check
OSS_HEADLESS=1 npm run test:browser
OSS_HEADLESS=1 npm run test:desktop
OSS_HEADLESS=1 npm run test:website
```

真实运行时的隔离测试使用 [`scripts/harness-compatibility.mjs`](../scripts/harness-compatibility.mjs)，具体输入见文件开头。需要自行提供已核验的官方运行时和待测包。此检查不自动下载或启动用户的日常桌面应用。

📋 更新后遇到问题，请使用[中文问题模板](https://github.com/d-dev0101/open-sea-skin/issues/new?template=bug.yml)，附系统、Harness/Open Sea 版本、安装路径与脱敏截图。先停用皮肤比较现象，不要删除整个配置、会话或锁文件。

## English scope

Harness **0.2.2-rc.1** is the November 8 checked release-channel baseline. The official packaged macOS runtime was exercised in an isolated `web` profile with npm 1.2.7, including CLI and graphical install/enable, actual Web client rendering, controls, uninstall and restart. The 1.2.8 fixes add sticky-composer gradient regressions and deterministic scheduling tests. **Native Windows Desktop E2E, native caption color correctness and a new complete native macOS GUI run are not claimed.** Registry-installed plugins can now update in the official manager; local archives still require manual replacement. Windows caption blocks, Mac GPU usage, distant highlight aliasing and independent wave speed remain tracked separately.
