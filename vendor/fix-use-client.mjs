// Post-build fix for @sisfo-remake/ui: tsup code-splitting moves client
// components into shared chunk-*.js files, and esbuild-plugin-preserve-directives
// only re-adds 'use client' to entry files. This prepends the directive to any
// chunk whose sourcemap includes a module that starts with 'use client'.
//
// Usage: node fix-use-client.mjs "<path to sisfo-ui-main/ui>"
import fs from 'node:fs'
import path from 'node:path'

const uiDir = path.resolve(process.argv[2] ?? '.')
const distDir = path.join(uiDir, 'dist')
const isClient = (src) => /^\s*['"]use client['"]/.test(src)

let fixed = 0
for (const file of fs.readdirSync(distDir)) {
  if (!/^chunk-.*\.js$/.test(file)) continue
  const jsPath = path.join(distDir, file)
  const mapPath = `${jsPath}.map`
  const code = fs.readFileSync(jsPath, 'utf8')
  if (isClient(code) || !fs.existsSync(mapPath)) continue

  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
  const hasClientSource = map.sources.some((src, i) => {
    const content = map.sourcesContent?.[i] ?? fs.readFileSync(path.resolve(distDir, src), 'utf8')
    return isClient(content)
  })
  if (!hasClientSource) continue

  fs.writeFileSync(jsPath, `"use client";\n${code}`)
  map.mappings = `;${map.mappings}`
  fs.writeFileSync(mapPath, JSON.stringify(map))
  fixed++
  console.log(`use client -> ${file}`)
}
console.log(`Done, ${fixed} chunk(s) fixed.`)
