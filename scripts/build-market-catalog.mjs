// Builds the ACRYL Desktop market artifacts from the consolidated multi-source
// catalog (scripts/aggregate-catalog.mjs), conforming to the
// dsh-community-market catalog contract:
//
//   public/v1/plugins
//     Standard provider page (schema catalog-provider-page 1.0.0), served by
//     GitHub Pages at https://acryldev.github.io/dsh-store/v1/plugins
//   public/.well-known/dsh-store-catalog-source.json
//     Catalog source manifest (schema catalog-source 1.0.0) that users
//     register in the Desktop market UI.
//
// The endpoint is a static page: it answers every query with the same response
// (the PAGE_LIMIT highest-starred plugins), so the manifest advertises no
// query features and defaultLimit == maxLimit == PAGE_LIMIT. Merged entries
// without a repository URL AND an npm package cannot conform to the item
// anyOf requirement and are skipped.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = resolve(root, 'src', 'data', 'consolidated-catalog.json')
const pagePath = resolve(root, 'public', 'v1', 'plugins')
const manifestPath = resolve(root, 'public', '.well-known', 'dsh-store-catalog-source.json')

export const PAGE_LIMIT = 50
export const MANIFEST_URL = 'https://acryldev.github.io/store/.well-known/dsh-store-catalog-source.json'

const ENDPOINT_URL = 'https://acryldev.github.io/store/v1/plugins'
const STORE_URL = 'https://acryldev.github.io/store/'

// Patterns mirrored from dsh-community-market/docs/schemas so emitted
// artifacts are validated with the same rules the Host applies.
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$/
const CATEGORY_ID = /^[a-z0-9][a-z0-9._:-]*$/
const HTTPS_URI = /^https:\/\/(?![^/?#]*@)(?![^/?#]*:)[^#]+$/
const NPM_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/

// Every property the provider-page item schema allows (additionalProperties: false).
const ITEM_KEYS = new Set([
  'id', 'name', 'displayName', 'summary', 'description', 'homepage',
  'latestVersion', 'license', 'categories', 'keywords', 'repository',
  'package', 'publisher', 'media', 'capabilities', 'compatibility', 'updatedAt',
])

function plainText(value, maxLength) {
  const cleaned = String(value ?? '').replace(CONTROL_CHARS, '').trim()
  if (cleaned.length === 0) return null
  return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength)
}

/** Maps one merged consolidated-catalog plugin to a provider-page item, or null when it cannot conform. */
export function marketItemFromCatalogPlugin(plugin) {
  const npmPackage = typeof plugin?.npmPackage === 'string' && plugin.npmPackage ? plugin.npmPackage : null
  const name = npmPackage ?? plainText(plugin?.name, 160)
  if (!name || name.length > 160) return null

  // The item identifier pattern forbids a leading '@', so scoped identities
  // (an npm-name fallback id) use a scope-stripped id; the canonical npm
  // identity stays in package.name. GitHub "owner/repo" ids are allowed.
  const rawId = typeof plugin?.id === 'string' && plugin.id ? plugin.id : name
  const id = rawId.startsWith('@') && NPM_NAME.test(rawId)
    ? rawId.slice(1)
    : rawId
  if (!IDENTIFIER.test(id)) return null

  const item = {
    id,
    name,
    displayName: plainText(name, 120),
    summary: plainText(plugin.description?.en, 1000)
      ?? plainText(plugin.description?.zh, 1000)
      ?? `DSH plugin ${name}`,
  }
  if (HTTPS_URI.test(plugin.repository ?? '')) {
    item.repository = { url: plugin.repository }
  }
  // Only claim an npm package when the merged catalog actually carries an npm
  // identity; a repo name that merely looks like an npm name is not a claim.
  if (npmPackage && NPM_NAME.test(npmPackage)) {
    item.package = { registry: 'npm', name: npmPackage }
  }

  const categories = [plugin.category]
    .filter(category => typeof category === 'string' && CATEGORY_ID.test(category))
  if (categories.length > 0) item.categories = categories.slice(0, 32)

  if (Object.keys(item).some(key => !ITEM_KEYS.has(key))) return null
  // Item schema requires repository XOR package.
  if (!item.repository && !item.package) return null
  return item
}

/** Builds the standard provider page document from the consolidated catalog. */
export function buildCatalogPage(catalog) {
  const plugins = Array.isArray(catalog?.plugins) ? catalog.plugins : []
  const items = []
  for (const plugin of plugins) {
    if (items.length >= PAGE_LIMIT) break
    const item = marketItemFromCatalogPlugin(plugin)
    if (!item) continue
    items.push(item)
  }
  return {
    schemaVersion: '1.0.0',
    generatedAt: typeof catalog?.generatedAt === 'string' && DATE_TIME.test(catalog.generatedAt)
      ? catalog.generatedAt
      : new Date().toISOString(),
    items,
    page: { total: plugins.length },
  }
}

/** Builds the catalog source manifest that Desktop users register by URL. */
export function buildSourceManifest() {
  return {
    manifestVersion: '1.0.0',
    providerId: 'dev.acryl.dshstore',
    name: 'DSH Store (community backup)',
    description: 'Consolidated DSH plugin catalog aggregated from npm keyword discovery, 1024Store, awesome-dsh-plugin, GitHub topics, and editorial seeds. Static endpoint, refreshed by scheduled aggregation.',
    homepage: STORE_URL,
    attribution: { name: 'dsh-store', url: STORE_URL },
    transport: { kind: 'https-json', endpoint: ENDPOINT_URL, method: 'GET' },
    query: { supported: [], defaultLimit: PAGE_LIMIT, maxLimit: PAGE_LIMIT, sorts: [] },
  }
}

async function main() {
  let catalog = {}
  try {
    catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
  } catch (error) {
    console.warn(`Could not read ${catalogPath} (${error.message}); emitting an empty catalog`)
  }
  const page = buildCatalogPage(catalog)
  await mkdir(dirname(pagePath), { recursive: true })
  await writeFile(pagePath, `${JSON.stringify(page, null, 2)}\n`)
  await mkdir(dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(buildSourceManifest(), null, 2)}\n`)
  const skipped = page.page.total - page.items.length
  console.log(`Built market catalog: ${page.items.length} of ${page.page.total} plugins (${skipped} beyond page limit or non-conforming) -> public/v1/plugins`)
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (invokedDirectly) await main()
