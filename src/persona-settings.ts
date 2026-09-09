/** Durable global prompt text owned by the Rabi persona plugin. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace exported to the DSH settings document. */
export const RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE = 'rabi-default-persona'

/** First-run defaults for the Rabi persona binding. */
export const DEFAULT_RABI_PERSONA_ENABLED = false
export const DEFAULT_RABI_MANAGER_BASE_URL = 'http://127.0.0.1:8790'
export const DEFAULT_RABI_PERSONA_ID = ''

/** Durable binding to one local RabiRoute persona. */
export interface RabiDefaultPersonaSettings {
  /** Whether every DSH agent receives the selected Rabi persona. */
  personaPrompt?: string
  enabled: boolean
  /** RabiRoute Manager address that owns the persona catalog and documents. */
  managerBaseUrl: string
  /** Selected Manager persona identifier. */
  roleId: string
}

/** Runtime loader configuration. It only supplies the first-run default. */
export interface Config {
  personaPrompt?: string
  enabled?: boolean
  managerBaseUrl?: string
  roleId?: string
}

/** Durable user-settings schema. */
export const RabiDefaultPersonaSettingsSchema: z<RabiDefaultPersonaSettings> = z.object({
  personaPrompt: z.string().default(''),
  enabled: z.boolean().default(DEFAULT_RABI_PERSONA_ENABLED),
  managerBaseUrl: z.string().default(DEFAULT_RABI_MANAGER_BASE_URL),
  roleId: z.string().default(DEFAULT_RABI_PERSONA_ID),
})

/** Loader configuration schema. */
export const Config: z<Config> = z.object({
  personaPrompt: z.string().default(''),
  enabled: z.boolean().default(DEFAULT_RABI_PERSONA_ENABLED),
  managerBaseUrl: z.string().default(DEFAULT_RABI_MANAGER_BASE_URL),
  roleId: z.string().default(DEFAULT_RABI_PERSONA_ID),
})
