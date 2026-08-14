/** Sidebar-foot launcher and compact controls for the native Open Sea skin. */
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { createOpenSeaStore } from './store.ts'
import type { OpenSeaSettingsInjected } from './OpenSeaSettingsRow.tsx'
import css from './OpenSeaQuickControls.module.css'

/** Props composed by the sidebar action slot, shared store and locale seat. */
export type OpenSeaQuickControlsProps =
  & PropsRuntime<'sidebar.footer.action'>
  & PropsStore<ReturnType<typeof createOpenSeaStore>>
  & PropsLocale<'settings.open-sea'>
  & OpenSeaSettingsInjected

function number(event: ChangeEvent<HTMLInputElement>): number {
  return Number(event.currentTarget.value)
}

function WaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 7.7c1.35-1.75 2.7-1.75 4.05 0s2.7 1.75 4.05 0 2.2-1.35 3.9-.55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 12c1.35-1.45 2.7-1.45 4.05 0s2.7 1.45 4.05 0 2.2-1.1 3.9-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55" />
    </svg>
  )
}

/** Compact, always-available controls anchored above the Harness Settings trigger. */
export function OpenSeaQuickControls({
  wide, useStore, t, setEnabled, setSea, setTime, setGlass, setAutoCycle,
}: OpenSeaQuickControlsProps) {
  const state = useStore(snapshot => snapshot)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const panelId = useId()
  const disabled = !state.ready || !state.enabled

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button, input:not(:disabled)')]
    if (controls.length === 0) return
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${css.trigger} ${wide ? css.wide : css.rail} ${open ? css.active : ''}`}
        aria-label={t('quick.label')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        title={wide ? undefined : t('quick.label')}
        onClick={() => { setOpen(value => !value) }}
      >
        <span className={css.icon}><WaveIcon /></span>
        {wide && <span className={css.triggerText}>{t('quick.label')}</span>}
        {wide && <span className={css.status} data-enabled={state.enabled || undefined} aria-hidden="true" />}
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className={css.panel}
          role="dialog"
          aria-modal="false"
          aria-label={t('quick.label')}
          onKeyDown={trapFocus}
        >
          <div className={css.panelHead}>
            <div>
              <div className={css.eyebrow}>OPEN SEA</div>
              <div className={css.panelTitle}>{t('quick.description')}</div>
            </div>
            <button className={css.close} type="button" aria-label={t('quick.close')} onClick={() => { setOpen(false); triggerRef.current?.focus() }}>×</button>
          </div>

          <label className={css.switchLine}>
            <span>{t('enabled')}</span>
            <input type="checkbox" checked={state.enabled} disabled={!state.ready} onChange={event => { setEnabled(event.currentTarget.checked) }} />
          </label>

          <div className={css.controls} aria-disabled={disabled}>
            <label className={css.control}>
              <span className={css.controlHead}><span>{t('sea')}</span><output>{state.sea}</output></span>
              <input type="range" min="0" max="100" step="1" value={state.sea} disabled={disabled} onChange={event => { setSea(number(event)) }} />
            </label>
            <label className={css.control}>
              <span className={css.controlHead}><span>{t('time')}</span><output>{state.time}</output></span>
              <input type="range" min="0" max="100" step="1" value={state.time} disabled={disabled} onChange={event => { setTime(number(event)) }} />
            </label>
            <label className={css.control}>
              <span className={css.controlHead}><span>{t('glass')}</span><output>{state.glass}%</output></span>
              <input type="range" min="40" max="90" step="1" value={state.glass} disabled={disabled} onChange={event => { setGlass(number(event)) }} />
            </label>
          </div>

          <label className={css.cycleLine}>
            <span>{t('autoCycle')}</span>
            <input type="checkbox" checked={state.autoCycle} disabled={disabled} onChange={event => { setAutoCycle(event.currentTarget.checked) }} />
          </label>
          <p className={css.note}>{t('quick.note')}</p>
        </div>
      )}
    </>
  )
}
