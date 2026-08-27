/** Sidebar panel that lists plans owned by the selected Rabi persona. */

import * as React from 'react'
import { Button, IconListPenOutline16, Tooltip, useDismissOnOutsidePointer } from '@deepseek-ai/dsh-client-ui-primitives'
import type { RabiDefaultPersonaKey } from './locales.ts'

const styles = {
  layer: { position: 'relative', flex: 'none', display: 'flex', alignItems: 'center', width: '100%', height: 42, margin: '8px 0 0' },
  rail: { width: 36, height: 36, margin: 0 },
  trigger: { display: 'inline-flex', alignItems: 'center', gap: 8, width: 'calc(100% + 4px)', height: 42, margin: '0 -2px', padding: '0 10px 0 8px', border: 'none', borderRadius: 12, background: 'transparent', color: 'var(--dsw-alias-label-primary)', font: 'inherit', fontSize: 14, cursor: 'pointer', overflow: 'hidden' },
  railTrigger: { justifyContent: 'center', gap: 0, width: 36, height: 36, margin: 0, padding: 0, borderRadius: '50%' },
  label: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  count: { flex: 'none', marginLeft: 'auto', color: 'var(--dsw-alias-label-tertiary)', fontSize: 12, lineHeight: '16px', fontVariantNumeric: 'tabular-nums' },
  panel: { position: 'fixed', zIndex: 30, display: 'flex', flexDirection: 'column', width: 420, maxWidth: 'calc(100vw - 24px)', maxHeight: '60vh', overflow: 'hidden', border: '1px solid var(--dsw-alias-border-inverted)', borderRadius: 12, background: 'var(--dsw-specific-menu)', boxShadow: 'var(--dsw-shadow-lv3)' },
  header: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '10px 12px', boxSizing: 'border-box' },
  title: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 500, lineHeight: '20px', color: 'var(--dsw-alias-label-primary)' },
  refresh: { marginLeft: 'auto' },
  body: { minHeight: 0, overflowY: 'auto', padding: '0 12px 12px' },
  note: { margin: '4px 0', fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)' },
  error: { margin: '4px 0', fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-state-error-primary)' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' },
  plan: { padding: 10, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 10, background: 'var(--dsw-alias-bg-layer-1)' },
  planTitle: { margin: 0, fontSize: 13, fontWeight: 500, lineHeight: '20px', color: 'var(--dsw-alias-label-primary)' },
  focus: { display: '-webkit-box', margin: '4px 0 0', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-secondary)' },
  meta: { margin: '8px 0 0', fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)' },
} as const

/** A compact projection of one Manager-owned Rabi plan. */
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

/** Manager response for the current persona's plan list. */
export interface RabiPlansStatus {
  roleId: string
  plans: RabiPlan[]
}

/** Dependencies supplied by the sidebar registration. */
export interface RabiPlansPanelInjected {
  readPlans: () => Promise<RabiPlansStatus>
  t: (key: RabiDefaultPersonaKey) => string
}

/** Render the plan trigger above the sidebar settings trigger. */
export function RabiPlansPanel(props: Partial<RabiPlansPanelInjected> & { wide: boolean }): React.ReactNode {
  if (props.readPlans === undefined || props.t === undefined) return null
  return <Loaded wide={props.wide} readPlans={props.readPlans} t={props.t} />
}

function Loaded({ wide, readPlans, t }: RabiPlansPanelInjected & { wide: boolean }): React.ReactNode {
  const [open, setOpen] = React.useState(false)
  const [plans, setPlans] = React.useState<RabiPlan[] | undefined>(undefined)
  const [error, setError] = React.useState<string | undefined>(undefined)
  const [loading, setLoading] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = React.useState<{ left: number, bottom: number }>()

  const refresh = React.useCallback(() => {
    setLoading(true)
    setError(undefined)
    void readPlans().then((result) => { setPlans(result.plans) }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : String(reason))
    }).finally(() => { setLoading(false) })
  }, [readPlans])

  React.useLayoutEffect(() => {
    if (!open) return
    const place = (): void => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (rect !== undefined) setAnchor({ left: rect.left, bottom: window.innerHeight - rect.top + 8 })
    }
    place()
    window.addEventListener('resize', place)
    return () => { window.removeEventListener('resize', place) }
  }, [open])

  React.useEffect(() => { if (open) refresh() }, [open, refresh])
  useDismissOnOutsidePointer(rootRef, open, setOpen)

  const title = t('plans')
  const trigger = (
    <button type="button" style={{ ...styles.trigger, ...(!wide ? styles.railTrigger : {}) }} aria-label={title} aria-expanded={open} onClick={() => { setOpen(value => !value) }}>
      <IconListPenOutline16 size={wide ? 16 : 18} />
      {wide && <><span style={styles.label}>{title}</span>{plans !== undefined && <span style={styles.count}>{plans.length}</span>}</>}
    </button>
  )

  return (
    <div ref={rootRef} style={{ ...styles.layer, ...(!wide ? styles.rail : {}) }}>
      {open && anchor !== undefined && (
        <section style={{ ...styles.panel, ...anchor }} aria-label={title}>
          <header style={styles.header}>
            <span style={styles.title}>{title}</span>
            <Button style={styles.refresh} variant="outline" size="sm" disabled={loading} onClick={refresh}>{t('refresh')}</Button>
          </header>
          <div style={styles.body}>
            {loading && plans === undefined && <p style={styles.note}>{t('plansLoading')}</p>}
            {error !== undefined && <p style={styles.error} role="alert">{error}</p>}
            {plans !== undefined && plans.length === 0 && <p style={styles.note}>{t('plansEmpty')}</p>}
            {plans !== undefined && plans.length > 0 && <ul style={styles.list}>{plans.map(plan => (
              <li key={plan.id} style={styles.plan}>
                <p style={styles.planTitle}>{plan.title}</p>
                {plan.focus !== '' && <p style={styles.focus}>{plan.focus}</p>}
                <p style={styles.meta}>{[plan.status, plan.priority, plan.currentStep].filter(value => value !== '').join(' · ')}</p>
              </li>
            ))}</ul>}
          </div>
        </section>
      )}
      {wide ? trigger : <Tooltip label={title} side="right" delayMs={500}>{trigger}</Tooltip>}
    </div>
  )
}
