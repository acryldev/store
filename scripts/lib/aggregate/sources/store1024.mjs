// Source: the 1024Store community catalog (deepseek1024.com), stored as one
// JSON file per plugin in imsai-sh/awesome-deepseek-harness-plugins.
// Reads a local checkout when DSH_STORE_1024_DIR is set; otherwise downloads
// the repository tarball and extracts catalog/plugins with the system tar.
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const TARBALL_URL = 'https://codeload.github.com/imsai-sh/awesome-deepseek-harness-plugins/tar.gz/HEAD'
const execFileAsync = promisify(execFile)

function pick(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeEntry(entry) {
  return {
    repository: pick(entry?.repository) ?? pick(entry?.url),
    npmPackage: pick(entry?.npm),
    name: pick(entry?.name) ?? pick(entry?.id),
    category: pick(entry?.category),
    description: { en: pick(entry?.description?.en), zh: pick(entry?.description?.zh) },
    stars: typeof entry?.stars === 'number' ? entry.stars : null,
    added: pick(entry?.added),
    pushedAt: null,
    source: '1024store',
  }
}

async function readCatalogPluginsDir(dir) {
  const files = (await readdir(dir)).filter(name => name.endsWith('.json'))
  const entries = []
  for (const file of files) {
    try {
      entries.push(normalizeEntry(JSON.parse(await readFile(join(dir, file), 'utf8'))))
    } catch (error) {
      console.warn(`1024store: skipping unreadable file ${file}: ${error.message}`)
    }
  }
  return entries
}

async function fetchRemoteTarball({ log = () => {} } = {}) {
  const workDir = await mkdtemp(join(tmpdir(), 'dsh-store-1024-'))
  try {
    const response = await fetch(TARBALL_URL)
    if (!response.ok) throw new Error(`1024store tarball download failed: ${response.status}`)
    const tarball = join(workDir, 'repo.tar.gz')
    await writeFile(tarball, Buffer.from(await response.arrayBuffer()))
    await execFileAsync('tar', ['-xzf', tarball, '-C', workDir])
    const extractedRoot = (await readdir(workDir)).find(name => name.startsWith('awesome-deepseek-harness-plugins'))
    if (!extractedRoot) throw new Error('1024store tarball did not contain the expected repo root')
    const entries = await readCatalogPluginsDir(join(workDir, extractedRoot, 'catalog', 'plugins'))
    log(`1024store fetched ${entries.length} entries from tarball`)
    return entries
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

/** Yields raw entries from the 1024Store plugin catalog. */
export async function fetchStore1024({ localDir, log = () => {} } = {}) {
  const dir = localDir ?? process.env.DSH_STORE_1024_DIR
  if (dir) {
    const entries = await readCatalogPluginsDir(dir)
    log(`1024store read ${entries.length} files from ${dir}`)
    return entries
  }
  return fetchRemoteTarball({ log })
}
