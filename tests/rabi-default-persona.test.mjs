import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const hostBundle = new URL('../lib/index.mjs', import.meta.url)

test('Rabi Manager 未连接时不阻断 DSH 回合', async () => {
  const bundle = await readFile(hostBundle, 'utf8')

  assert.match(bundle, /if \(this\.cachedKey !== settingsKey\(settings\) \|\| this\.cachedPrompt === ""\) return "";/)
  assert.doesNotMatch(bundle, /Rabi persona is enabled but has not been loaded from Rabi Manager/)
})
