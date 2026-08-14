/** Shared root-scoped viewing state for the background and its settings row. */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { OpenSeaSettings } from '../settings-contract.ts'

/** Reactive state mirrored from the durable settings scope. */
export interface OpenSeaState extends OpenSeaSettings {
  /** Whether the first settings snapshot has landed. */
  ready: boolean
  /** Monotonic adoption counter used to reject stale writes. */
  revision: number
}

type OpenSeaActions = {
  sync: (draft: OpenSeaState, settings: OpenSeaSettings, revision: number) => void
}

/**
 * Declare the state shared by the two root-scope slot registrations.
 * @returns a Harness store handle.
 */
export function createOpenSeaStore(): EngineStoreHandle<OpenSeaState, OpenSeaActions> {
  return defineStore({
    init: (): OpenSeaState => ({
      ready: false,
      revision: -1,
      enabled: true,
      sea: 45,
      time: 55,
      glass: 72,
      autoCycle: true,
      quality: 'auto',
    }),
    actions: {
      sync: (draft, settings: OpenSeaSettings, revision: number) => {
        if (revision <= draft.revision) return
        Object.assign(draft, settings, { ready: true, revision })
      },
    },
  })
}
