/** Host half for the Manager-owned global Rabi persona binding. */

import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  Config,
  DEFAULT_RABI_MANAGER_BASE_URL,
  DEFAULT_RABI_PERSONA_ENABLED,
  DEFAULT_RABI_PERSONA_ID,
  RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE,
  RabiDefaultPersonaSettingsSchema,
} from './persona-settings.ts'
import type { RabiDefaultPersonaSettings } from './persona-settings.ts'

export {
  Config,
  DEFAULT_RABI_MANAGER_BASE_URL,
  DEFAULT_RABI_PERSONA_ENABLED,
  DEFAULT_RABI_PERSONA_ID,
  RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE,
  RabiDefaultPersonaSettingsSchema,
  type RabiDefaultPersonaSettings,
} from './persona-settings.ts'

const SETTINGS_NAMESPACE = settingsNamespace(RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE)
const PROMPT_SECTION_NAME = 'rabi:global-default-persona'
const PROMPT_SECTION_ORDER = 10
const REQUEST_TIMEOUT_MS = 10_000

/** One persona offered by the RabiRoute Manager. */
export interface RabiPersonaOption {
  id: string
  label: string
}

/** Rabi Manager connectivity and current persisted binding. */
export interface RabiPersonaStatus {
  online: boolean
  message: string
  personas: RabiPersonaOption[]
  settings: RabiDefaultPersonaSettings
}

/** A compact Manager-owned plan rendered by the Rabi sidebar. */
export interface RabiPlan {
  id: string
  title: string
  focus: string
  status: string
  priority: string
  currentStep: string
  nextAction: string
  waitingFor: string
  updatedAt: string
}

/** Plans owned by the currently selected Rabi persona. */
export interface RabiPlansStatus {
  roleId: string
  plans: RabiPlan[]
}

interface CatalogProtocol {
  TypertRemoteService: typeof TypertRemoteService
  Remote: typeof Remote
}

function defaultSettings(): RabiDefaultPersonaSettings {
  return { enabled: DEFAULT_RABI_PERSONA_ENABLED, managerBaseUrl: DEFAULT_RABI_MANAGER_BASE_URL, roleId: DEFAULT_RABI_PERSONA_ID }
}

function settingsKey(settings: RabiDefaultPersonaSettings): string {
  return `${settings.managerBaseUrl}\u0000${settings.roleId}`
}

function normalizeManagerBaseUrl(value: unknown): string {
  const text = String(value ?? '').trim().replace(/\/+$/, '')
  if (text === '') throw new Error('Rabi Manager address is required.')
  let parsed: URL
  try {
    parsed = new URL(text)
  } catch {
    throw new Error('Rabi Manager address must be an HTTP or HTTPS URL.')
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Rabi Manager address must be an HTTP or HTTPS URL.')
  return parsed.toString().replace(/\/$/, '')
}

function normalizeSettings(value: unknown): RabiDefaultPersonaSettings {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Rabi persona settings are invalid.')
  const source = value as Partial<RabiDefaultPersonaSettings>
  if (typeof source.enabled !== 'boolean' || typeof source.managerBaseUrl !== 'string' || typeof source.roleId !== 'string') {
    throw new TypeError('Rabi persona settings are invalid.')
  }
  const roleId = source.roleId.trim()
  if (roleId === '.' || roleId === '..' || /[\\/]/.test(roleId)) throw new Error('Rabi persona identifier is invalid.')
  if (source.enabled && roleId === '') throw new Error('Select a Rabi persona before enabling it.')
  return { enabled: source.enabled, managerBaseUrl: normalizeManagerBaseUrl(source.managerBaseUrl), roleId }
}

async function managerFetch(baseUrl: string, pathname: string): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(`${normalizeManagerBaseUrl(baseUrl)}${pathname}`, {
      headers: { accept: 'application/json, text/markdown;q=0.9' },
      signal: controller.signal,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Rabi Manager is unavailable: ${message}`)
  } finally {
    clearTimeout(timeout)
  }
}

/** Read the catalog exposed by the RabiRoute Manager. */
export async function listManagerPersonas(managerBaseUrl: string): Promise<RabiPersonaOption[]> {
  const response = await managerFetch(managerBaseUrl, '/api/personas')
  const body = await response.text()
  if (!response.ok) throw new Error(`Rabi Manager HTTP ${response.status}: ${body}`)
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error('Rabi Manager returned an invalid persona catalog.')
  }
  if (parsed === null || typeof parsed !== 'object' || (parsed as { code?: unknown }).code !== 0 || !Array.isArray((parsed as { personas?: unknown }).personas)) {
    throw new Error('Rabi Manager returned an invalid persona catalog.')
  }
  return (parsed as { personas: unknown[] }).personas.map((persona) => {
    if (persona === null || typeof persona !== 'object') throw new Error('Rabi Manager returned an invalid persona.')
    const item = persona as { personaId?: unknown, name?: unknown, title?: unknown }
    if (typeof item.personaId !== 'string' || item.personaId.trim() === '') throw new Error('Rabi Manager returned an invalid persona.')
    return { id: item.personaId, label: typeof item.name === 'string' && item.name.trim() !== '' ? item.name : typeof item.title === 'string' && item.title.trim() !== '' ? item.title : item.personaId }
  })
}

/** Read the selected persona document only through the RabiRoute Manager. */
export async function readManagerPersona(settings: RabiDefaultPersonaSettings): Promise<string> {
  const response = await managerFetch(settings.managerBaseUrl, `/api/roles/${encodeURIComponent(settings.roleId)}/persona-document`)
  const text = (await response.text()).trim()
  if (!response.ok) throw new Error(`Rabi Manager HTTP ${response.status}: ${text}`)
  if (text === '') throw new Error('Rabi Manager returned an empty persona document.')
  return text
}

/** Read every plan currently owned by the selected persona. */
export async function listManagerPlans(settings: RabiDefaultPersonaSettings): Promise<RabiPlansStatus> {
  if (settings.roleId === '') throw new Error('Select a Rabi persona before reading plans.')
  const response = await managerFetch(settings.managerBaseUrl, `/api/roles/${encodeURIComponent(settings.roleId)}/plans`)
  const body = await response.text()
  if (!response.ok) throw new Error(`Rabi Manager HTTP ${response.status}: ${body}`)
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error('Rabi Manager returned an invalid plan list.')
  }
  if (parsed === null || typeof parsed !== 'object' || (parsed as { code?: unknown }).code !== 0 || !Array.isArray((parsed as { data?: unknown }).data)) {
    throw new Error('Rabi Manager returned an invalid plan list.')
  }
  const plans = (parsed as { data: unknown[] }).data.map((plan): RabiPlan => {
    if (plan === null || typeof plan !== 'object') throw new Error('Rabi Manager returned an invalid plan.')
    const item = plan as Partial<RabiPlan>
    if (typeof item.id !== 'string' || typeof item.title !== 'string') throw new Error('Rabi Manager returned an invalid plan.')
    return {
      id: item.id,
      title: item.title,
      focus: typeof item.focus === 'string' ? item.focus : '',
      status: typeof item.status === 'string' ? item.status : '',
      priority: typeof item.priority === 'string' ? item.priority : '',
      currentStep: typeof item.currentStep === 'string' ? item.currentStep : '',
      nextAction: typeof item.nextAction === 'string' ? item.nextAction : '',
      waitingFor: typeof item.waitingFor === 'string' ? item.waitingFor : '',
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : '',
    }
  })
  return { roleId: settings.roleId, plans }
}

function createRabiPersonaCatalogClass(protocol: CatalogProtocol) {
  const initializers: Array<(service: RabiPersonaCatalog) => void> = []

  class RabiPersonaCatalog extends protocol.TypertRemoteService {
    private readonly scope
    private cachedKey = ''
    private cachedPrompt = ''

    constructor(ctx: Context, scope: ReturnType<Context['settings']['register']>) {
      super(ctx, 'rabiPersonaCatalog')
      this.scope = scope
      for (const initialize of initializers) initialize.call(this)
    }

    async status(): Promise<RabiPersonaStatus> {
      const settings = normalizeSettings(this.scope.get() ?? defaultSettings())
      try {
        return { online: true, message: '', personas: await listManagerPersonas(settings.managerBaseUrl), settings }
      } catch (error: unknown) {
        return { online: false, message: error instanceof Error ? error.message : String(error), personas: [], settings }
      }
    }

    async configure(request: RabiDefaultPersonaSettings): Promise<RabiPersonaStatus> {
      const settings = normalizeSettings(request)
      if (!settings.enabled) {
        this.setCachedPrompt(settings, '')
        await this.scope.update(settings)
        return await this.status()
      }
      const [prompt, personas] = await Promise.all([readManagerPersona(settings), listManagerPersonas(settings.managerBaseUrl)])
      if (!personas.some(persona => persona.id === settings.roleId)) throw new Error('The selected Rabi persona is no longer available from Manager.')
      this.setCachedPrompt(settings, prompt)
      await this.scope.update(settings)
      return { online: true, message: '', personas, settings }
    }

    async plans(): Promise<RabiPlansStatus> {
      return await listManagerPlans(normalizeSettings(this.scope.get() ?? defaultSettings()))
    }

    async refresh(): Promise<void> {
      const settings = normalizeSettings(this.scope.get() ?? defaultSettings())
      this.setCachedPrompt(settings, settings.enabled ? await readManagerPersona(settings) : '')
    }

    prompt(): string {
      const settings = normalizeSettings(this.scope.get() ?? defaultSettings())
      if (!settings.enabled) return ''
      if (this.cachedKey !== settingsKey(settings) || this.cachedPrompt === '') return ''
      return this.cachedPrompt
    }

    private setCachedPrompt(settings: RabiDefaultPersonaSettings, prompt: string): void {
      this.cachedKey = settingsKey(settings)
      this.cachedPrompt = prompt
    }
  }

  for (const method of ['status', 'configure', 'plans'] as const) {
    protocol.Remote(method)(RabiPersonaCatalog.prototype[method], {
      private: false,
      static: false,
      name: method,
      addInitializer(initializer) { initializers.push(initializer) },
    })
  }
  return RabiPersonaCatalog
}

const LocalRabiPersonaCatalog = createRabiPersonaCatalogClass({ TypertRemoteService, Remote })
let profileRabiPersonaCatalog: typeof LocalRabiPersonaCatalog | undefined

function createProfileRabiPersonaCatalog(): typeof LocalRabiPersonaCatalog {
  if (profileRabiPersonaCatalog !== undefined) return profileRabiPersonaCatalog
  try {
    const dshHome = resolve(process.env.DSH_HOME?.trim() || join(homedir(), '.dsh'))
    const profileRequire = createRequire(join(dshHome, 'profiles', 'web', 'package.json'))
    const protocol = profileRequire('@deepseek-ai/dsh-typert-protocol') as Partial<CatalogProtocol>
    if (typeof protocol.TypertRemoteService === 'function' && typeof protocol.Remote === 'function') {
      profileRabiPersonaCatalog = createRabiPersonaCatalogClass(protocol as CatalogProtocol)
      return profileRabiPersonaCatalog
    }
  } catch {
    // Standalone tests use the linked package's protocol instance.
  }
  profileRabiPersonaCatalog = LocalRabiPersonaCatalog
  return profileRabiPersonaCatalog
}

/** Register Manager-backed settings, catalog RPC, and global prompt contribution. */
export function apply(ctx: Context, config: Config = {}): void {
  ctx.inject(['settings', 'systemPrompt'], (injected) => {
    const scope = injected.settings.register(SETTINGS_NAMESPACE, RabiDefaultPersonaSettingsSchema, {
      base: {
        enabled: config.enabled ?? DEFAULT_RABI_PERSONA_ENABLED,
        managerBaseUrl: config.managerBaseUrl ?? DEFAULT_RABI_MANAGER_BASE_URL,
        roleId: config.roleId ?? DEFAULT_RABI_PERSONA_ID,
      },
    })
    const RabiPersonaCatalog = createProfileRabiPersonaCatalog()
    const catalog = new RabiPersonaCatalog(ctx, scope)
    injected.systemPrompt.section({ name: PROMPT_SECTION_NAME, order: PROMPT_SECTION_ORDER, text: () => catalog.prompt() })
    ctx.effect(() => {
      void catalog.refresh().catch(() => undefined)
      return ctx.on('settings/updated', (namespace) => {
        if (namespace === RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE) void catalog.refresh().catch(() => undefined)
      })
    })
  })
}
