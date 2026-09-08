// Aggregates DSH/ACRYL package sources into src/data/consolidated-catalog.json.
//
// Sources (all best-effort; a failing source is logged and skipped so one
// outage cannot empty the catalog):
//   npm:acryl-package       npm registry search, exact keyword
//   npm:dsh-plugin          npm registry search, exact keyword
//   1024store               imsai-sh/awesome-deepseek-harness-plugins (deepseek1024.com data)
//   awesome-dsh-plugin      awesome-dsh-plugin/awesome-dsh-plugin data/plugins/*.yml
//   github-topic            GitHub search for topics dsh-plugin + dsh-plugins
//   composio                one-time editorial seed list
//
// Merged entries are deduplicated by GitHub owner/repo identity (else npm
// name) and keep a per-entry `sources` provenance array.
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { mergeEntries } from './lib/aggregate/merge.mjs'
import { fetchNpmKeyword } from './lib/aggregate/sources/npm-keyword.mjs'
import { fetchStore1024 } from './lib/aggregate/sources/store1024.mjs'
import { fetchAwesomeDsh } from './lib/aggregate/sources/awesome-dsh.mjs'
import { fetchGithubTopics } from './lib/aggregate/sources/github-topics.mjs'
import { fetchComposioSeed } from './lib/aggregate/sources/composio-seed.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src', 'data', 'consolidated-catalog.json')

const NPM_KEYWORDS = ['acryl-package', 'dsh-plugin']
const GITHUB_TOPICS = ['dsh-plugin', 'dsh-plugins']

const log = message => console.log(message)

async function runSource(label, fetcher) {
  try {
    const started = Date.now()
    const entries = await fetcher()
    log(`${label}: ${entries.length} entries (${Date.now() - started}ms)`)
    return { label, entries, error: null }
  } catch (error) {
    console.error(`${label}: FAILED - ${error.message}`)
    return { label, entries: [], error: error.message }
  }
}

async function main() {
  const generatedAt = new Date().toISOString()
  const token = process.env.GITHUB_TOKEN ?? undefined

  const results = []
  for (const keyword of NPM_KEYWORDS) {
    results.push(await runSource(`npm:${keyword}`, () => fetchNpmKeyword(keyword, { log })))
  }
  results.push(await runSource('1024store', () => fetchStore1024({ log })))
  results.push(await runSource('awesome-dsh-plugin', () => fetchAwesomeDsh({ log })))
  results.push(await runSource('github-topic', () => fetchGithubTopics({ topics: GITHUB_TOPICS, token, log })))
  results.push(await runSource('composio', () => fetchComposioSeed()))

  const merged = mergeEntries(results.flatMap(result => result.entries), generatedAt)
  const catalog = {
    schemaVersion: 1,
    generatedAt: merged.generatedAt,
    sources: results.map(result => ({
      id: result.label,
      count: result.entries.length,
      ok: result.error === null,
      error: result.error,
    })),
    categories: merged.categories,
    plugins: merged.plugins,
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`)
  const failed = catalog.sources.filter(source => !source.ok).map(source => source.id)
  console.log(`Consolidated catalog: ${catalog.plugins.length} plugins from ${catalog.sources.length} sources -> src/data/consolidated-catalog.json${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`)
  if (catalog.plugins.length === 0) process.exitCode = 1
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (invokedDirectly) await main()
