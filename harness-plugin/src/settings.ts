/** Host-side validation for the native Open Sea preference section. */
import z from '@deepseek-ai/schemastery'
import {
  DEFAULT_OPEN_SEA_SETTINGS, OPEN_SEA_QUALITIES, type OpenSeaSettings,
} from './settings-contract.ts'

/** Durable Open Sea schema and wire validation. */
export const OpenSeaSettingsSchema: z<OpenSeaSettings> = z.object({
  enabled: z.boolean().default(DEFAULT_OPEN_SEA_SETTINGS.enabled),
  sea: z.natural().max(100).default(DEFAULT_OPEN_SEA_SETTINGS.sea),
  time: z.natural().max(100).default(DEFAULT_OPEN_SEA_SETTINGS.time),
  glass: z.natural().min(40).max(90).default(DEFAULT_OPEN_SEA_SETTINGS.glass),
  autoCycle: z.boolean().default(DEFAULT_OPEN_SEA_SETTINGS.autoCycle),
  quality: z.union([...OPEN_SEA_QUALITIES]).default(DEFAULT_OPEN_SEA_SETTINGS.quality),
})
