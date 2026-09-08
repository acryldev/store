// Identity normalization shared by all aggregator sources.
// A consolidated entry is keyed either by its GitHub "owner/repo" identity
// (lowercased) or, when no repository is known, by its npm package name.

const GITHUB_URL = /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?(?:[?#].*)?$/
const OWNER_REPO = /^([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9._-]+)$/
const NPM_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/

/** Extracts a GitHub repository URL from loose input, or null. */
export function normalizeRepository(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//.test(trimmed)) return GITHUB_URL.test(trimmed) ? trimmed : null
  if (OWNER_REPO.test(trimmed)) return `https://github.com/${trimmed}`
  return null
}

/** Returns the lowercase "owner/repo" identity for a repository URL, or null. */
export function repoIdentity(repository) {
  if (typeof repository !== 'string') return null
  const match = GITHUB_URL.exec(repository.trim())
  return match ? `${match[1].toLowerCase()}/${match[2].toLowerCase()}` : null
}

/** Returns true when the value is a plausible npm package name. */
export function isNpmName(value) {
  return typeof value === 'string' && value.length <= 214 && NPM_NAME.test(value)
}

/** Chooses the primary identity: repo identity wins over npm name. */
export function entryIdentity({ repository, npmPackage }) {
  return repoIdentity(repository) ?? (isNpmName(npmPackage) ? npmPackage : null)
}

/** Picks the first non-empty string, in argument order. */
export function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  }
  return null
}

/** Merges bilingual descriptions, preferring longer existing text per language. */
export function mergeDescription(target, addition) {
  const merged = { ...target }
  for (const lang of ['en', 'zh']) {
    const candidate = typeof addition?.[lang] === 'string' ? addition[lang].trim() : ''
    if (!candidate) continue
    if (!merged[lang] || candidate.length > merged[lang].length) merged[lang] = candidate
  }
  return merged
}

/** Earliest non-null YYYY-MM-DD date. */
export function earliestDate(...values) {
  let earliest = null
  for (const value of values) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) continue
    if (earliest === null || value < earliest) earliest = value
  }
  return earliest
}

/** Install command for a merged entry. */
export function installCommand(entry) {
  if (typeof entry.npmPackage === 'string' && entry.npmPackage) {
    return `dsh plugin --profile web add ${entry.npmPackage}`
  }
  if (typeof entry.repository === 'string' && entry.repository) {
    const identity = repoIdentity(entry.repository)
    if (identity) return `dsh plugin --profile web add ${identity}`
  }
  return null
}
