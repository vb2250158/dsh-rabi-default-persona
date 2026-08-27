import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(repositoryRoot, 'src/client/index.ts')
const output = resolve(repositoryRoot, 'lib/client.js')
const hostSource = resolve(repositoryRoot, 'src/index.ts')
const hostOutput = resolve(repositoryRoot, 'lib/index.mjs')
const moduleId = 'dsh-rabi-default-persona'

const result = await build({
  entryPoints: [source],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  write: false,
  sourcemap: false,
  legalComments: 'none',
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/*'],
  logLevel: 'silent',
})

const bundled = result.outputFiles.at(0)
if (bundled === undefined) throw new Error('Rabi default persona bundle did not produce JavaScript')

const artifact = `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(moduleId)},\n  factory: (require) => {\n    var module = { exports: {} }\n    var exports = module.exports\n${bundled.text}\n    return module.exports\n  },\n})\n`

await mkdir(dirname(output), { recursive: true })
await writeFile(output, artifact)
await build({
  entryPoints: [hostSource],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  outfile: hostOutput,
  external: ['@deepseek-ai/*'],
  legalComments: 'none',
  logLevel: 'silent',
})
console.log(`Built ${output}`)
console.log(`Built ${hostOutput}`)
