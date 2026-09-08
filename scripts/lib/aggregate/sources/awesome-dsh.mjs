// Source: awesome-dsh-plugin (awesome-dsh-plugin.com), one YAML file per
// plugin under data/plugins/ in awesome-dsh-plugin/awesome-dsh-plugin, plus
// optional data/stars.json enrichment.
import { execFile } from 'node:child_process'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { parse } from 'yaml'

const TARBALL_URL = 'https://codeload.github.com/awesome-dsh-plugin/awesome-dsh-plugin/tar.gz/HEAD'
const execFileAsync = promisify(execFile)

function pick(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeYaml(doc, starsByRepo) {
  const repository = pick(doc?.url)
  return {
    repository,
    npmPackage: pick(doc?.npm) ?? (pick(doc?.tarball)?.includes('registry.npmjs.org') ? pick(doc?.tarball).split('/').pop()?.replace(/\.tgz$/, '') : null),
    name: pick(doc?.name) ?? repository,
    category: pick(doc?.category),
    description: { en: pick(doc?.description?.en), zh: pick(doc?.description?.zh) },
    stars: typeof doc?.stars === 'number' ? doc.stars : null,
    added: pick(doc?.added),
    pushedAt: null,
    source: 'awesome-dsh-plugin',
  }
}

async function fetchRemoteTarball({ log = () => {} } = {}) {
  const workDir = await mkdtemp(join(tmpdir(), 'dsh-store-awesomedsh-'))
  try {
    const response = await fetch(TARBALL_URL)
    if (!response.ok) throw new Error(`awesome-dsh-plugin tarball download failed: ${response.status}`)
    const tarball = join(workDir, 'repo.tar.gz')
    await writeFile(tarball, Buffer.from(await response.arrayBuffer()))
    await execFileAsync('tar', ['-xzf', tarball, '-C', workDir])
    const root = (await readdir(workDir)).find(name => name.startsWith('awesome-dsh-plugin'))
    if (!root) throw new Error('awesome-dsh-plugin tarball did not contain the expected repo root')
    return await readDataDir(join(workDir, root, 'data'), { log })
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

async function readDataDir(dataDir, { log = () => {} } = {}) {
  const pluginsDir = join(dataDir, 'plugins')
  const files = (await readdir(pluginsDir)).filter(name => name.endsWith('.yml') || name.endsWith('.yaml'))
  let starsByRepo = null
  try {
    starsByRepo = JSON.parse(await readFile(join(dataDir, 'stars.json'), 'utf8'))
    if (typeof starsByRepo !== 'object' || starsByRepo === null || Array.isArray(starsByRepo)) starsByRepo = null
  } catch {
    starsByRepo = null
  }
  const entries = []
  for (const file of files) {
    try {
      const doc = parse(await readFile(join(pluginsDir, file), 'utf8'))
      const entry = normalizeYaml(doc)
      if (starsByRepo) {
        const identity = typeof entry.repository === 'string'
          ? entry.repository.replace(/^https?:\/\/github\.com\//i, '').toLowerCase()
          : null
        const stars = identity ? starsByRepo[identity] : undefined
        if (typeof stars === 'number') entry.stars = stars
      }
      entries.push(entry)
    } catch (error) {
      console.warn(`awesome-dsh-plugin: skipping unreadable file ${file}: ${error.message}`)
    }
  }
  log(`awesome-dsh-plugin read ${entries.length} YAML entries from ${pluginsDir}`)
  return entries
}

/** Yields raw entries from the awesome-dsh-plugin catalog. */
export async function fetchAwesomeDsh({ localDir, log = () => {} } = {}) {
  const dir = localDir ?? process.env.DSH_STORE_AWESOME_DIR
  if (dir) return readDataDir(dir, { log })
  return fetchRemoteTarball({ log })
}
