// Node module hooks allowing the publicodes model to be loaded outside of Next:
// - resolves the `@/` path alias (see tsconfig.json)
// - resolves extensionless imports to .ts/.js files
// - loads .yaml / .yml / .publicodes files as JS modules (like yaml-loader)
import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { parse } from 'yaml'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const extensions = ['.ts', '.js', '.mjs']

export async function resolve(specifier, context, nextResolve) {
  let candidate = null
  if (specifier.startsWith('@/')) {
    candidate = path.join(root, specifier.slice(2))
  } else if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    context.parentURL?.startsWith('file:')
  ) {
    candidate = path.resolve(
      path.dirname(fileURLToPath(context.parentURL)),
      specifier,
    )
  }

  if (candidate) {
    if (!existsSync(candidate) || statSync(candidate).isDirectory()) {
      const found = extensions
        .map((ext) => candidate + ext)
        .find((file) => existsSync(file))
      if (found) candidate = found
    }
    return nextResolve(pathToFileURL(candidate).href, context)
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (/\.(ya?ml|publicodes)$/.test(url)) {
    const source = await readFile(fileURLToPath(url), 'utf8')
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${JSON.stringify(parse(source))};`,
    }
  }
  if (url.endsWith('.ts')) {
    // The project's .ts files are ES modules (package.json has no "type")
    return nextLoad(url, { ...context, format: 'module-typescript' })
  }
  return nextLoad(url, context)
}
