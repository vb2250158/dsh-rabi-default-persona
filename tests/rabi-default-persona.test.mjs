import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const hostBundle = new URL('../lib/index.mjs', import.meta.url)

test('Rabi Manager 未连接时不阻断 DSH 回合', async () => {
  const bundle = await readFile(hostBundle, 'utf8')

  assert.match(bundle, /if \(this\.cachedKey !== settingsKey\(settings\) \|\| this\.cachedPrompt === ""\) return "";/)
  assert.doesNotMatch(bundle, /Rabi persona is enabled but has not been loaded from Rabi Manager/)
})

// Exercise the browser entrypoint with only the settings services available.
test('Rabi 插件仅注册设置入口，不再挂载侧栏计划面板', async () => {
  const { runInNewContext } = await import('node:vm')
  const bundle = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  let plugin
  runInNewContext(bundle, {
    window: { __ModuleLoader__: { load: ({ factory }) => { plugin = factory(() => ({})) } } },
  })
  const registrations = []
  const service = { status: async () => ({ ok: true, value: {} }), configure: async () => ({ ok: true, value: {} }) }
  const dispose = async () => {}
  const ctx = {
    remote: { $mount: async (remote) => {
      assert.deepEqual(Array.from(remote.descriptors, item => item.method), ['status', 'configure'])
      return dispose
    } },
    reflect: { get: () => service },
    effect: (effect) => effect(),
    locale: { register: () => () => {}, bind: () => key => key },
    slots: {
      inject: (name, register) => { assert.equal(name, 'settings.section'); register() },
      register: (registration) => { registrations.push(registration); return () => {} },
    },
  }
  assert.equal(await plugin.apply(ctx), dispose)
  assert.equal(registrations.length, 1)
  assert.equal(registrations[0].id, 'rabi-default-persona')
  await registrations[0].inject().readStatus()
  await registrations[0].inject().saveBinding({})
})
