/** Native Open Sea Client half: background slot, glass token layer and settings row. */
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import {
  DEFAULT_OPEN_SEA_SETTINGS, OPEN_SEA_SETTINGS_NAMESPACE,
  type OpenSeaQuality, type OpenSeaSettings,
} from '../settings-contract.ts'
import { OpenSeaBackground } from './OpenSeaBackground.tsx'
import { OpenSeaSettingsRow, type OpenSeaSettingsInjected } from './OpenSeaSettingsRow.tsx'
import { OpenSeaQuickControls } from './OpenSeaQuickControls.tsx'
import { createOpenSeaStore } from './store.ts'
import { en, zh, type OpenSeaLocaleKey } from './locales.ts'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-open-sea-skin'
const SETTINGS_NS = 'settings.open-sea'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Native Open Sea settings copy. */
    'settings.open-sea': OpenSeaLocaleKey
  }
}

function rounded(value: number): number {
  return Number(value.toFixed(2))
}

function rgba(red: number, green: number, blue: number, value: number): string {
  return `rgba(${red}, ${green}, ${blue}, ${rounded(Math.min(0.96, Math.max(0.28, value)))})`
}

function glassTokens(glass: number): ThemeTokenOverrides {
  const light = glass / 100
  const dark = Math.max(0.4, light - 0.12)
  const token = (lightValue: string, darkValue: string) => ({ light: lightValue, dark: darkValue })
  return {
    '--dsw-alias-bg-base': token(rgba(255, 255, 255, light), rgba(9, 12, 16, dark)),
    '--dsw-alias-bg-layer-1': token(rgba(255, 255, 255, light), rgba(12, 16, 22, dark)),
    '--dsw-alias-bg-layer-2': token(rgba(255, 255, 255, light), rgba(16, 20, 27, dark)),
    '--dsw-alias-bg-layer-3': token(rgba(255, 255, 255, light), rgba(20, 25, 33, dark)),
    '--dsw-alias-bg-module-platform': token(rgba(245, 246, 247, light + 0.02), rgba(13, 17, 23, dark + 0.02)),
    '--dsw-alias-bg-multi-select': token(rgba(245, 246, 247, light + 0.02), rgba(13, 17, 23, dark + 0.02)),
    '--dsw-alias-bg-overlay': token(rgba(233, 236, 242, light + 0.10), rgba(18, 22, 30, dark + 0.14)),
    '--dsw-specific-sidebar-fill': token(rgba(249, 250, 251, light - 0.04), rgba(11, 15, 21, dark - 0.05)),
    '--dsw-specific-selector': token(rgba(245, 246, 247, light + 0.02), rgba(13, 17, 23, dark + 0.02)),
  }
}

/** Services required for durable settings, locale, theme and both slot contributions. */
export const inject = ['slots', 'locale', 'theme', 'connection', 'remote', 'settingsScope']

/**
 * Mount the native background and its General settings controls.
 * @param ctx - Client Cordis root context.
 */
export function apply(ctx: ClientContext): void {
  const host = ctx.settingsScope.bind<OpenSeaSettings>({ namespace: OPEN_SEA_SETTINGS_NAMESPACE })
  const store = createOpenSeaStore()
  let actions: BoundActions<typeof store> | undefined
  let revision = 0
  let tokenKey = ''
  let disposeTokens: (() => void) | undefined

  const applyTokens = (next: OpenSeaSettings): void => {
    const key = `${next.enabled}:${next.glass}`
    if (key === tokenKey) return
    tokenKey = key
    disposeTokens?.()
    disposeTokens = next.enabled
      ? ctx.theme.overrideTokens(PACKAGE_NAME, glassTokens(next.glass))
      : undefined
  }
  const adopt = (): void => {
    const snapshot = host.getSnapshot()
    if (snapshot.status !== 'ready' || snapshot.value === undefined) return
    const next: OpenSeaSettings = { ...DEFAULT_OPEN_SEA_SETTINGS, ...snapshot.value }
    revision += 1
    actions?.sync(next, revision)
    applyTokens(next)
  }
  const bind = (bound: BoundActions<typeof store>): void => {
    actions = bound
    adopt()
  }

  ctx.effect(() => host.subscribe(adopt), 'ui-open-sea-skin: settings adoption')
  ctx.effect(() => () => { disposeTokens?.() }, 'ui-open-sea-skin: glass token layer')
  ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), 'ui-open-sea-skin: settings dictionaries')
  adopt()

  ctx.slots.inject('shell.background', () => ctx.slots.register({
    name: 'shell.background',
    store,
    inject: (bound) => { bind(bound); return {} },
  }, OpenSeaBackground))

  const write = (field: keyof OpenSeaSettings, value: unknown): void => {
    void host.set(field, value)
  }
  const settingsFace = (bound: BoundActions<typeof store>): OpenSeaSettingsInjected => {
    bind(bound)
    return {
      setEnabled: value => { write('enabled', value) },
      setSea: value => { write('sea', value) },
      setTime: value => {
        void Promise.all([host.set('time', value), host.set('autoCycle', false)])
      },
      setGlass: value => { write('glass', value) },
      setAutoCycle: value => { write('autoCycle', value) },
      setQuality: (value: OpenSeaQuality) => { write('quality', value) },
    }
  }
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'open-sea-skin',
    order: 30,
    store,
    locale: SETTINGS_NS,
    inject: settingsFace,
  }, OpenSeaSettingsRow))
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'open-sea-skin-controls',
    order: 20,
    store,
    locale: SETTINGS_NS,
    inject: settingsFace,
  }, OpenSeaQuickControls))
}
