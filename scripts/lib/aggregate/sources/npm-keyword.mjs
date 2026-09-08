// Source: npm registry search by exact keyword (acryl-package, dsh-plugin).
const SEARCH_URL = 'https://registry.npmjs.org/-/v1/search'
const PAGE_SIZE = 250
const MAX_PAGES = 20
// npm search rate-limits deep pagination (429) and occasionally 5xx; retry
// those with exponential backoff + jitter, honoring Retry-After when present.
const MAX_ATTEMPTS = 5
const BASE_DELAY_MS = 2000
const INTER_PAGE_DELAY_MS = 500

const sleep = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) return reject(new Error('aborted'))
  const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve() }, ms)
  const onAbort = () => { clearTimeout(timer); reject(new Error('aborted')) }
  signal?.addEventListener('abort', onAbort, { once: true })
})

async function fetchPage(keyword, from, signal, log) {
  const url = `${SEARCH_URL}?text=keywords:${encodeURIComponent(keyword)}&size=${PAGE_SIZE}&from=${from}`
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { signal, headers: { accept: 'application/json' } })
    if (response.ok) return response.json()
    const retryable = response.status === 429 || response.status >= 500
    if (!retryable || attempt >= MAX_ATTEMPTS) {
      response.body?.cancel()
      throw new Error(`npm search failed: ${response.status} for ${url}`)
    }
    const retryAfter = Number(response.headers.get('retry-after'))
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 60_000)
      : Math.round(BASE_DELAY_MS * 2 ** (attempt - 1) * (0.8 + Math.random() * 0.4))
    log(`npm:${keyword} ${response.status} at from=${from}, retry ${attempt}/${MAX_ATTEMPTS - 1} in ${Math.round(delay / 1000)}s`)
    response.body?.cancel()
    await sleep(delay, signal)
  }
}

/** Yields raw entries for every npm package carrying the exact keyword. */
export async function fetchNpmKeyword(keyword, { signal, log = () => {} } = {}) {
  const raw = []
  const first = await fetchPage(keyword, 0, signal, log)
  raw.push(...first.objects.map(object => normalizeNpm(object, keyword)))
  const total = Math.min(first.total ?? raw.length, PAGE_SIZE * MAX_PAGES)
  for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) {
    await sleep(INTER_PAGE_DELAY_MS, signal)
    const page = await fetchPage(keyword, from, signal, log)
    if (!(page.objects ?? []).length) break
    raw.push(...page.objects.map(object => normalizeNpm(object, keyword)))
    log(`npm:${keyword} fetched ${raw.length}/${total}`)
  }
  return raw
}

function normalizeNpm(object, keyword) {
  const pkg = object?.package ?? {}
  const links = pkg.links ?? {}
  const repository = typeof pkg.repository === 'string'
    ? pkg.repository
    : typeof pkg.repository?.url === 'string'
      ? pkg.repository.url
      : typeof links.repository === 'string' ? links.repository : null
  return {
    repository,
    npmPackage: pkg.name ?? null,
    name: pkg.name ?? null,
    category: null,
    description: typeof pkg.description === 'string' ? pkg.description : null,
    stars: null,
    added: typeof pkg.date === 'string' ? pkg.date.slice(0, 10) : null,
    pushedAt: null,
    version: pkg.version ?? null,
    publisher: pkg.publisher?.username ?? null,
    source: `npm:${keyword}`,
  }
}
