/** Native Open Sea settings dictionaries. */

/** Simplified Chinese dictionary and key-set authority. */
export const zh = {
  'title': '海洋皮肤',
  'enabled': '启用 Open Sea',
  'enabled.description': '在 Harness 界面背后显示 WebGPU 实时海洋',
  'sea': '波浪大小',
  'time': '日光',
  'glass': '玻璃不透明度',
  'autoCycle': '12 分钟自动昼夜循环',
  'quality': '渲染质量',
  'quality.auto': '自动',
  'quality.low': '低功耗',
  'quality.high': '高质量',
  'reducedMotion': '系统开启「减少动效」时，海洋会自动降到 20 FPS 并显著减慢。',
  'quick.label': '皮肤设置',
  'quick.description': '调节海浪与光线',
  'quick.close': '关闭皮肤设置',
  'quick.note': '参数即时生效并自动保存；更多选项位于「设置 → 通用设置」。',
} satisfies Record<string, string>

/** Locale key union. */
export type OpenSeaLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  'title': 'Open Sea Skin',
  'enabled': 'Enable Open Sea',
  'enabled.description': 'Show the realtime WebGPU ocean behind the Harness interface',
  'sea': 'Sea state',
  'time': 'Daylight',
  'glass': 'Glass opacity',
  'autoCycle': 'Automatic 12-minute daylight cycle',
  'quality': 'Rendering quality',
  'quality.auto': 'Automatic',
  'quality.low': 'Low power',
  'quality.high': 'High quality',
  'reducedMotion': 'When Reduce Motion is enabled, the ocean drops to 20 FPS and moves substantially slower.',
  'quick.label': 'Skin settings',
  'quick.description': 'Tune waves and daylight',
  'quick.close': 'Close skin settings',
  'quick.note': 'Changes apply and save instantly. More options are available under Settings → General.',
} satisfies Record<OpenSeaLocaleKey, string>
