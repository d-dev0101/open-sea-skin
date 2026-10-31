# 🔎 兼容性记录 / Compatibility

最后核对：**2026-11-01**。插件修复版：**1.2.7**。

## 官方 Harness 更新了吗？

更新了。本次查询 `@deepseek-ai/dsh` 的 `latest` 与 `next` 均为 **0.2.1-rc.5**，官方 Mac/Windows 桌面更新通道也指向该版本。它仍是预发布版本；另有实验性的 alpha 通道，本次未将 alpha 视为日常兼容基线。

- [官方 0.2.1-rc.5 发布记录](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-rc.5)（2026-10-30，提交 `b830ec9`）
- [该版本插件管理说明](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.5/packages/client/ui-plugin-manager/README.zh.md)
- [npm 官方包元数据](https://registry.npmjs.org/@deepseek-ai%2fdsh/latest)

## 这次实际测了什么？

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

## 安装源核验

2026-11-01 查询 npm 官方源与中国大陆镜像：两处 `latest` 都为 **1.2.6**，该版本 metadata 和压缩包下载均 HTTP 200，389,854 字节，SHA-512 integrity 与 shasum 校验通过；SHA-256 均为 `b49e8f4c6927a9d770b9be5b6c16e9fa3c79a25875ed2319334d9b475fbf7325`。两处 **1.2.7 均为 404**，等待 npm 发布。

真实 rc.5 Web 插件页还通过了「添加插件 → 本地 `.tgz` 完整路径 → 安装 → 立即启用 → 海洋加载」流程。自定义源是用户填写的 npm registry，不是第三个固定镜像；可用性取决于该源是否提供本包及其认证要求。[三个选项的填写方式](install.zh.md#三种安装源如何填写)

## 修复与尚在跟进

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

Harness **0.2.1-rc.5** is the checked release-channel baseline. The official packaged macOS runtime was exercised in an isolated profile, including package install, actual Web client rendering, controls, uninstall and clean restart. Browser fixtures additionally cover macOS/Windows shell structures. **Native Windows Desktop E2E and a new complete native Desktop GUI run are not claimed.** Ocean math and deterministic WebGPU/WebGL2 comparisons preserve the existing appearance; distant highlight aliasing and independent wave speed remain tracked separately.
