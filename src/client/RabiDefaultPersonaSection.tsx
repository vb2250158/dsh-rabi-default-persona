/** Settings UI for the Manager-backed global Rabi persona. */

import * as React from 'react'
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { RabiDefaultPersonaSettings } from '../persona-settings.ts'
import type { RabiDefaultPersonaKey } from './locales.ts'

const styles = {
  section: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 760, color: 'var(--dsw-alias-label-primary)' },
  title: { margin: 0, fontSize: 16, lineHeight: '24px', fontWeight: 500 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, lineHeight: '20px', fontWeight: 500 },
  notice: { margin: 0, fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-state-warn-label)' },
  error: { margin: 0, fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-state-error-primary)' },
  actions: { display: 'flex', alignItems: 'center', gap: 10 },
  saved: { fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-state-success-primary)' },
  select: { width: '100%', minHeight: 32, padding: '6px 10px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', font: 'inherit' },
} as const

interface RabiPersonaOption { id: string, label: string }

/** Manager state supplied by the host Remote service. */
export interface RabiPersonaStatus {
  online: boolean
  message: string
  personas: RabiPersonaOption[]
  settings: RabiDefaultPersonaSettings
}

/** Dependencies supplied by the registration layer. */
export interface RabiDefaultPersonaSectionInjected {
  readStatus: () => Promise<RabiPersonaStatus>
  saveBinding: (value: RabiDefaultPersonaSettings) => Promise<RabiPersonaStatus>
  t: (key: RabiDefaultPersonaKey) => string
}

/** Render the global Rabi persona preference section. */
export function RabiDefaultPersonaSection(props: Partial<RabiDefaultPersonaSectionInjected>): React.ReactNode {
  const { readStatus, saveBinding, t } = props
  if (readStatus === undefined || saveBinding === undefined || t === undefined) return null
  return <Loaded readStatus={readStatus} saveBinding={saveBinding} t={t} />
}

function Loaded(props: RabiDefaultPersonaSectionInjected): React.ReactNode {
  const [status, setStatus] = React.useState<RabiPersonaStatus | undefined>(undefined)
  const [draft, setDraft] = React.useState<RabiDefaultPersonaSettings>({ enabled: false, managerBaseUrl: 'http://127.0.0.1:8790', roleId: '' })
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>(undefined)

  const refresh = React.useCallback(() => {
    setError(undefined)
    void props.readStatus().then((next) => {
      setStatus(next)
      setDraft(next.settings)
      if (!next.online) setError(next.message)
    }).catch((reason: unknown) => {
      setStatus(undefined)
      setError(reason instanceof Error ? reason.message : String(reason))
    })
  }, [props])

  React.useEffect(() => { refresh() }, [refresh])

  const save = (): void => {
    setSaving(true)
    setSaved(false)
    setError(undefined)
    void props.saveBinding({ ...draft, managerBaseUrl: draft.managerBaseUrl.trim(), roleId: draft.roleId.trim() }).then((next) => {
      setStatus(next)
      setDraft(next.settings)
      setSaved(true)
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : String(reason))
    }).finally(() => { setSaving(false) })
  }

  const changed = status === undefined
    || draft.enabled !== status.settings.enabled
    || draft.managerBaseUrl !== status.settings.managerBaseUrl
    || draft.roleId !== status.settings.roleId
    || (draft.personaPrompt ?? '') !== (status.settings.personaPrompt ?? '')

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>{props.t('title')}</h2>
      <label style={styles.field}>
        <span style={styles.label}>{props.t('enabled')}</span>
        <input
          type="checkbox"
          checked={draft.enabled}
          disabled={saving || status?.online !== true}
          onChange={(event) => { setDraft(current => ({ ...current, enabled: event.target.checked })); setSaved(false) }}
        />
      </label>
      <label style={styles.field}>
        <span style={styles.label}>{props.t('managerAddress')}</span>
        <Input
          value={draft.managerBaseUrl}
          placeholder={props.t('managerAddressPlaceholder')}
          disabled={saving}
          onChange={(event) => { setDraft(current => ({ ...current, managerBaseUrl: event.target.value })); setSaved(false); setError(undefined) }}
        />
      </label>
      <label style={styles.field}>
        <span style={styles.label}>{props.t('personaPrompt')}</span>
        <textarea value={draft.personaPrompt ?? ''} disabled={saving} rows={6} style={styles.select}
          onChange={event => { setDraft(current => ({ ...current, personaPrompt: event.target.value })); setSaved(false) }} />
      </label>
      <div style={styles.actions}>
        <Button variant="outline" disabled={saving} onClick={refresh}>{props.t('refresh')}</Button>
      </div>
      <label style={styles.field}>
        <span style={styles.label}>{props.t('persona')}</span>
        <select
          style={styles.select}
          value={draft.roleId}
          disabled={saving || status?.online !== true}
          onChange={(event) => { setDraft(current => ({ ...current, roleId: event.target.value })); setSaved(false); setError(undefined) }}
        >
          <option value="">{props.t('selectPersona')}</option>
          {status?.personas.map(persona => <option key={persona.id} value={persona.id}>{persona.label}</option>)}
        </select>
      </label>
      {status !== undefined && !status.online ? <p style={styles.notice}>{props.t('managerOffline')}</p> : null}
      {error === undefined ? null : <p style={styles.error}>{error}</p>}
      <div style={styles.actions}>
        <Button disabled={saving || !changed || (draft.enabled && status?.online !== true)} onClick={save}>{saving ? props.t('saving') : props.t('save')}</Button>
        {saved ? <span style={styles.saved} role="status">{props.t('saved')}</span> : null}
      </div>
    </section>
  )
}
