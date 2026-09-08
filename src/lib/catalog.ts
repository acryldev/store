import catalogJson from '../data/consolidated-catalog.json'
import type { CatalogPlugin, CatalogSort, ConsolidatedCatalogDocument } from '../types'

export const catalog = catalogJson as ConsolidatedCatalogDocument

/** npm keyword that marks packages maintained for the ACRYL ecosystem. */
export const ACRYL_SOURCE = 'npm:acryl-package'

export function isAcrylPackage(plugin: CatalogPlugin): boolean {
  return plugin.sources.includes(ACRYL_SOURCE)
}

/** Resolves a public/ asset path against the deployment base (/store/). */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export function formatCompact(value: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function repositorySlug(repository: string | null): string | null {
  if (!repository) return null
  return repository
    .replace(/^git\+/, '')
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
}

export function installCommand(plugin: CatalogPlugin): string | null {
  return plugin.install ?? null
}

export function filterPlugins(
  plugins: readonly CatalogPlugin[],
  query: string,
  category: string,
): CatalogPlugin[] {
  const needle = query.trim().toLocaleLowerCase()
  return plugins.filter(plugin => {
    if (category !== 'all' && plugin.category !== category) return false
    if (!needle) return true
    return [plugin.name, plugin.id, plugin.npmPackage, plugin.category, plugin.description.en]
      .some(value => typeof value === 'string' && value.toLocaleLowerCase().includes(needle))
  })
}

export function sortPlugins(plugins: readonly CatalogPlugin[], sort: CatalogSort): CatalogPlugin[] {
  const sorted = [...plugins]
  if (sort === 'name') return sorted.sort((left, right) => left.name.localeCompare(right.name))
  if (sort === 'newest') return sorted.sort((left, right) => (right.added ?? '').localeCompare(left.added ?? ''))
  return sorted.sort((left, right) => (right.stars ?? -1) - (left.stars ?? -1))
}

export function packagePath(plugin: CatalogPlugin): string {
  return `/packages/${encodeURIComponent(plugin.id)}`
}

export function findPlugin(id: string): CatalogPlugin | undefined {
  const normalized = decodeURIComponent(id).toLocaleLowerCase()
  return catalog.plugins.find(plugin => plugin.id.toLocaleLowerCase() === normalized)
}

export function acrylPackages(): CatalogPlugin[] {
  return catalog.plugins.filter(isAcrylPackage)
}
