// Merges raw source entries into the consolidated catalog.
// Every source module yields entries shaped like:
//   { repository, npmPackage, name, category, description, stars, added, pushedAt, source }
// where `source` is that module's provenance tag. Merge is keyed by identity
// (repo owner/repo, else npm name) with per-entry source provenance retained.
import { entryIdentity, firstText, installCommand, mergeDescription, earliestDate } from './normalize.mjs'

const SOURCE_PRIORITY = ['npm:acryl-package', 'npm:dsh-plugin', '1024store', 'awesome-dsh-plugin', 'github-topic', 'composio']

function betterValue(a, b) {
  if (a === null || a === undefined) return b
  if (b === null || b === undefined) return a
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b)
  return a
}

/**
 * Merges raw entries into a consolidated plugin list.
 * @param {Array<object>} rawEntries entries from all sources
 * @param {string} generatedAt ISO timestamp for the run
 */
export function mergeEntries(rawEntries, generatedAt) {
  const byIdentity = new Map()
  for (const raw of rawEntries) {
    if (!raw || typeof raw !== 'object') continue
    const npmPackage = typeof raw.npmPackage === 'string' && raw.npmPackage ? raw.npmPackage : null
    const repository = typeof raw.repository === 'string' && raw.repository ? raw.repository : null
    const identity = entryIdentity({ repository, npmPackage })
    if (!identity) continue

    const source = typeof raw.source === 'string' && raw.source ? raw.source : 'unknown'
    const incoming = {
      id: identity,
      name: firstText(raw.name, npmPackage, repository) ?? identity,
      repository,
      npmPackage,
      category: typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim() : null,
      description: {},
      stars: typeof raw.stars === 'number' && Number.isFinite(raw.stars) ? raw.stars : null,
      added: earliestDate(raw.added),
      pushedAt: typeof raw.pushedAt === 'string' && raw.pushedAt ? raw.pushedAt : null,
      sources: [source],
    }
    if (typeof raw.description === 'string' && raw.description.trim()) {
      incoming.description.en = raw.description.trim()
    } else if (raw.description && typeof raw.description === 'object') {
      incoming.description = mergeDescription({}, raw.description)
    }

    const existing = byIdentity.get(identity)
    if (!existing) {
      byIdentity.set(identity, incoming)
      continue
    }
    existing.npmPackage = betterValue(existing.npmPackage, incoming.npmPackage)
    existing.repository = betterValue(existing.repository, incoming.repository)
    existing.category = existing.category ?? incoming.category
    existing.description = mergeDescription(existing.description, incoming.description)
    existing.stars = betterValue(existing.stars, incoming.stars)
    existing.added = earliestDate(existing.added, incoming.added)
    existing.pushedAt = betterValue(existing.pushedAt, incoming.pushedAt)
    if (!existing.sources.includes(source)) existing.sources.push(source)
  }

  const plugins = [...byIdentity.values()]
    .map(entry => ({ ...entry, install: installCommand(entry) }))
    .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || a.id.localeCompare(b.id))

  const categories = [...new Set(plugins.map(plugin => plugin.category).filter(Boolean))].sort()
  return { generatedAt, categories, plugins }
}
