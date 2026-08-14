/** Durable Open Sea settings shared by the Host schema and Client scope. */

/** Settings namespace owned by the native Open Sea plugin. */
export const OPEN_SEA_SETTINGS_NAMESPACE = 'ui-open-sea-skin'

/** Supported renderer quality policies. */
export const OPEN_SEA_QUALITIES = ['auto', 'low', 'high'] as const

/** Renderer quality policy. */
export type OpenSeaQuality = typeof OPEN_SEA_QUALITIES[number]

/** Durable Open Sea preference section. */
export interface OpenSeaSettings {
  /** Whether the background and glass token layer are active. */
  enabled: boolean
  /** Gerstner wave strength on a 0-100 scale. */
  sea: number
  /** Daylight position on a 0-100 scale. */
  time: number
  /** Light-mode base surface opacity on a 40-90 percentage scale. */
  glass: number
  /** Whether the renderer advances through its twelve-minute daylight cycle. */
  autoCycle: boolean
  /** Automatic, explicitly low, or explicitly high rendering quality. */
  quality: OpenSeaQuality
}

/** Defaults applied when a field is absent from user-settings. */
export const DEFAULT_OPEN_SEA_SETTINGS: Readonly<OpenSeaSettings> = Object.freeze({
  enabled: true,
  sea: 45,
  time: 55,
  glass: 72,
  autoCycle: true,
  quality: 'auto',
})
