export interface CatalogSourceStatus {
  readonly id: string
  readonly count: number
  readonly ok: boolean
  readonly error: string | null
}

export interface CatalogPluginDescription {
  readonly en: string | null
  readonly zh?: string | null
}

export interface CatalogPlugin {
  readonly id: string
  readonly name: string
  readonly repository: string | null
  readonly npmPackage: string | null
  readonly category: string | null
  readonly description: CatalogPluginDescription
  readonly stars: number | null
  readonly added: string | null
  readonly pushedAt: string | null
  readonly sources: readonly string[]
  readonly install: string | null
}

export interface ConsolidatedCatalogDocument {
  readonly schemaVersion: number
  readonly generatedAt: string
  readonly sources: readonly CatalogSourceStatus[]
  readonly categories: readonly string[]
  readonly plugins: readonly CatalogPlugin[]
}

export type CatalogSort = 'stars' | 'newest' | 'name'
