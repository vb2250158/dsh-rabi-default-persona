/** Browser half of the Manager-backed global Rabi persona settings plugin. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { RabiDefaultPersonaSection, type RabiDefaultPersonaSectionInjected, type RabiPersonaStatus } from './RabiDefaultPersonaSection.tsx'
import { en, zh, type RabiDefaultPersonaKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.rabiDefaultPersona': RabiDefaultPersonaKey
  }
}

const NS = 'settings.rabiDefaultPersona'

const bindingRequestSchema = {
  parse(value: unknown): { enabled: boolean, managerBaseUrl: string, roleId: string } {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Rabi persona settings are invalid.')
    const item = value as { enabled?: unknown, managerBaseUrl?: unknown, roleId?: unknown }
    if (typeof item.enabled !== 'boolean' || typeof item.managerBaseUrl !== 'string' || typeof item.roleId !== 'string') throw new TypeError('Rabi persona settings are invalid.')
    return item as { enabled: boolean, managerBaseUrl: string, roleId: string }
  },
}

const statusSchema = {
  parse(value: unknown): RabiPersonaStatus {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Rabi persona status is invalid.')
    const item = value as Partial<RabiPersonaStatus>
    if (typeof item.online !== 'boolean' || typeof item.message !== 'string' || !Array.isArray(item.personas) || item.settings === undefined) {
      throw new TypeError('Rabi persona status is invalid.')
    }
    return item as RabiPersonaStatus
  },
}

const request = (typeSymbol: string, schema: { parse(value: unknown): unknown }) => ({
  name: 'request', wire: 'request', source: 'json', codec: { mode: 'strict' as const, typeSymbol, schema },
})

const rabiPersonaCatalogRemote = {
  package: 'dsh-rabi-default-persona',
  descriptors: [
    {
      id: 'dsh-rabi-default-persona#rabiPersonaCatalog/status',
      service: 'rabiPersonaCatalog', namespace: 'rabiPersonaCatalog', method: 'status', invocation: { kind: 'direct' as const },
      parameters: [],
      result: { mode: 'strict' as const, typeSymbol: 'dsh-rabi-default-persona#RabiPersonaStatus', schema: statusSchema },
    },
    {
      id: 'dsh-rabi-default-persona#rabiPersonaCatalog/configure',
      service: 'rabiPersonaCatalog', namespace: 'rabiPersonaCatalog', method: 'configure', invocation: { kind: 'direct' as const },
      parameters: [request('dsh-rabi-default-persona#RabiPersonaBinding', bindingRequestSchema)],
      result: { mode: 'strict' as const, typeSymbol: 'dsh-rabi-default-persona#RabiPersonaStatus', schema: statusSchema },
    },
  ],
}

function unwrap<T>(value: { ok?: boolean, value?: T, error?: { message?: string } }, operation: string): T {
  if (value.ok && value.value !== undefined) return value.value
  throw new Error(value.error?.message ?? `Rabi persona ${operation} failed.`)
}

/** Browser services required by this plugin. */
export const inject = ['slots', 'locale', 'remote']

/** Register the global Rabi settings page. */
export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  const dispose = await ctx.remote.$mount(rabiPersonaCatalogRemote)
  const service = ctx.reflect.get('remote.rabiPersonaCatalog') as {
    status?: () => Promise<{ ok?: boolean, value?: RabiPersonaStatus, error?: { message?: string } }>
    configure?: (request: RabiPersonaStatus['settings']) => Promise<{ ok?: boolean, value?: RabiPersonaStatus, error?: { message?: string } }>
  } | undefined
  if (service?.status === undefined || service.configure === undefined) throw new Error('Rabi persona catalog Remote did not mount.')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'rabi-default-persona: copy dictionaries')
  const t = ctx.locale.bind(NS) as RabiDefaultPersonaSectionInjected['t']

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'rabi-default-persona',
    order: 18,
    label: () => t('nav'),
    inject: () => ({
      readStatus: async () => unwrap(await service.status!(), 'status'),
      saveBinding: async value => unwrap(await service.configure!(value), 'configure'),
      t,
    }),
  }, RabiDefaultPersonaSection))

  return dispose
}
