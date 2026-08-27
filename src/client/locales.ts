/** Copy for the Rabi global persona settings page. */

export const en = {
  nav: 'Rabi persona',
  title: 'Rabi',
  enabled: 'Enable Rabi for all DSH sessions',
  managerAddress: 'Manager address',
  managerAddressPlaceholder: 'http://127.0.0.1:8790',
  refresh: 'Refresh',
  persona: 'Persona',
  selectPersona: 'Select a persona',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved',
  managerOffline: 'Rabi Manager is offline.',
  plans: 'Plans',
  plansLoading: 'Loading plans…',
  plansEmpty: 'No plans for this persona.',
} as const

export type RabiDefaultPersonaKey = keyof typeof en

export const zh: { [Key in RabiDefaultPersonaKey]: string } = {
  nav: 'Rabi 人格',
  title: 'Rabi',
  enabled: '全局启用 Rabi',
  managerAddress: 'Manager 地址',
  managerAddressPlaceholder: 'http://127.0.0.1:8790',
  refresh: '刷新',
  persona: '人格',
  selectPersona: '选择人格',
  save: '保存',
  saving: '正在保存……',
  saved: '已保存',
  managerOffline: 'Rabi Manager 未启动或无法连接。',
  plans: '计划',
  plansLoading: '正在读取计划……',
  plansEmpty: '这个人格还没有计划。',
}
