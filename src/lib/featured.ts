import type { CatalogPlugin } from '../types'
import { catalog } from './catalog'

export interface FeaturedEntry {
  readonly id: string
  readonly badge: string
  readonly blurb: string
}

/** Curated placements pinned above the directory, in order. Ids must exist in the consolidated catalog. */
export const FEATURED: readonly FeaturedEntry[] = [
  {
    id: 'acryl-dsh-editor-plugin',
    badge: 'Featured',
    blurb:
      'Our reference DSH plugin — a VS Code-style editor view (file tree, Monaco, ripgrep search, Markdown preview, git diff). It is also the worked example in the publishing guide.',
  },
  {
    id: 'cordis-plugin-graph',
    badge: 'Featured',
    blurb:
      'A live, zoomable Cytoscape graph of the running Cordis context, as a Settings tab. Plugin fibers as phase-coloured nodes; toggleable inject-dependency, resolved-provider, and Loader-tree-nesting edges. Better eyes on the plugin architecture you actually booted.',
  },
]

export interface FeaturedPlugin {
  readonly plugin: CatalogPlugin
  readonly entry: FeaturedEntry
}

export function featuredPlugins(): FeaturedPlugin[] {
  const featured: FeaturedPlugin[] = []
  for (const entry of FEATURED) {
    const plugin = catalog.plugins.find(candidate => candidate.id === entry.id)
    if (plugin) featured.push({ plugin, entry })
  }
  return featured
}

export function featuredEntry(id: string): FeaturedEntry | undefined {
  const normalized = id.toLocaleLowerCase()
  return FEATURED.find(entry => entry.id.toLocaleLowerCase() === normalized)
}
