// Source: GitHub repository search by topic (topic:dsh-plugin, topic:dsh-plugins).
// GitHub's search API caps results at 1000 per query; that limit is accepted
// and documented. Set GITHUB_TOKEN to raise the rate limit (CI provides one).
const API_URL = 'https://api.github.com/search/repositories'
const PER_PAGE = 100
const MAX_PAGES = 10 // 10 x 100 = the API's hard cap for one search query

async function fetchTopic(topic, { signal, token, log = () => {} }) {
  const raw = []
  const headers = { accept: 'application/vnd.github+json' }
  if (token) headers.authorization = `Bearer ${token}`
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${API_URL}?q=topic:${encodeURIComponent(topic)}&per_page=${PER_PAGE}&page=${page}`
    const response = await fetch(url, { signal, headers })
    if (response.status === 403 || response.status === 429) {
      console.warn(`github-topic:${topic}: rate limited at page ${page}; keeping ${raw.length} entries`)
      break
    }
    if (!response.ok) throw new Error(`GitHub search failed: ${response.status} for ${url}`)
    const data = await response.json()
    const items = data.items ?? []
    raw.push(...items.map(item => normalizeGithubRepo(item)))
    log(`github-topic:${topic} fetched ${raw.length}/${Math.min(data.total_count ?? raw.length, PER_PAGE * MAX_PAGES)}`)
    if (items.length < PER_PAGE) break
  }
  return raw
}

function normalizeGithubRepo(item) {
  return {
    repository: typeof item.html_url === 'string' ? item.html_url : null,
    npmPackage: null,
    name: typeof item.full_name === 'string' ? item.full_name : null,
    category: null,
    description: typeof item.description === 'string' ? item.description : null,
    stars: typeof item.stargazers_count === 'number' ? item.stargazers_count : null,
    added: null,
    pushedAt: typeof item.pushed_at === 'string' ? item.pushed_at : null,
    source: 'github-topic',
  }
}

/** Yields raw entries for the DSH plugin GitHub topics. */
export async function fetchGithubTopics({ topics = ['dsh-plugin', 'dsh-plugins'], signal, token, log = () => {} } = {}) {
  const raw = []
  for (const topic of topics) {
    raw.push(...await fetchTopic(topic, { signal, token, log }))
  }
  return raw
}
