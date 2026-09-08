import { describe, expect, it } from 'vitest'

import {
  MANIFEST_URL,
  PAGE_LIMIT,
  buildCatalogPage,
  buildSourceManifest,
  marketItemFromCatalogPlugin,
} from './build-market-catalog.mjs'

function plugin(overrides = {}) {
  return {
    id: 'omdsh-dev/dsh-genui',
    name: 'dsh-genui',
    repository: 'https://github.com/omdsh-dev/dsh-genui',
    npmPackage: null,
    category: 'ui',
    description: { en: 'Render interactive components inside replies.' },
    stars: 42,
    added: null,
    pushedAt: null,
    sources: ['composio'],
    install: 'dsh plugin --profile web add omdsh-dev/dsh-genui',
    ...overrides,
  }
}

describe('marketItemFromCatalogPlugin', () => {
  it('maps a repository-backed plugin to a conforming item', () => {
    const item = marketItemFromCatalogPlugin(plugin())
    expect(item).toMatchObject({
      id: 'omdsh-dev/dsh-genui',
      name: 'dsh-genui',
      repository: { url: 'https://github.com/omdsh-dev/dsh-genui' },
      categories: ['ui'],
      summary: 'Render interactive components inside replies.',
    })
    expect(item.package).toBeUndefined()
  })

  it('emits package info for npm-backed plugins', () => {
    const item = marketItemFromCatalogPlugin(plugin({ id: 'dsh-editor', npmPackage: 'dsh-editor', repository: null }))
    expect(item.package).toEqual({ registry: 'npm', name: 'dsh-editor' })
    expect(item.repository).toBeUndefined()
  })

  it('scope-strips a leading @ from the id but keeps the scoped canonical name', () => {
    const item = marketItemFromCatalogPlugin(plugin({ id: '@acryl/dsh-editor', npmPackage: '@acryl/dsh-editor', repository: null }))
    expect(item.id).toBe('acryl/dsh-editor')
    expect(item.package).toEqual({ registry: 'npm', name: '@acryl/dsh-editor' })
  })

  it('falls back to the zh description, then a default summary', () => {
    const zhOnly = marketItemFromCatalogPlugin(plugin({ description: { zh: '中文描述' } }))
    expect(zhOnly.summary).toBe('中文描述')
    const none = marketItemFromCatalogPlugin(plugin({ description: {} }))
    expect(none.summary).toBe('DSH plugin dsh-genui')
  })

  it('drops entries with neither a valid repository nor an npm package', () => {
    expect(marketItemFromCatalogPlugin(plugin({ repository: 'not-a-url', npmPackage: null }))).toBeNull()
    expect(marketItemFromCatalogPlugin(plugin({ repository: 'http://insecure.example/a', npmPackage: null }))).toBeNull()
  })

  it('drops entries with a non-conforming category instead of failing', () => {
    const item = marketItemFromCatalogPlugin(plugin({ category: 'Not Valid!' }))
    expect(item.categories).toBeUndefined()
    expect(item.id).toBe('omdsh-dev/dsh-genui')
  })

  it('scrubs control characters from text fields', () => {
    const item = marketItemFromCatalogPlugin(plugin({ description: { en: 'line1\u0007line2' } }))
    expect(item.summary).toBe('line1line2')
  })
})

describe('buildCatalogPage', () => {
  it('caps items at PAGE_LIMIT while reporting the full total', () => {
    const plugins = Array.from({ length: PAGE_LIMIT + 10 }, (_, index) =>
      plugin({ id: `a/p${index}`, name: `p${index}`, stars: 1000 - index }))
    const page = buildCatalogPage({ generatedAt: '2026-09-08T00:00:00.000Z', plugins })
    expect(page.schemaVersion).toBe('1.0.0')
    expect(page.items).toHaveLength(PAGE_LIMIT)
    expect(page.page.total).toBe(PAGE_LIMIT + 10)
    expect(page.generatedAt).toBe('2026-09-08T00:00:00.000Z')
  })

  it('stamps generatedAt when the catalog lacks a valid timestamp', () => {
    const page = buildCatalogPage({ generatedAt: 'nope', plugins: [] })
    expect(page.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(page.items).toEqual([])
    expect(page.page.total).toBe(0)
  })
})

describe('buildSourceManifest', () => {
  it('declares the static transport contract for the Pages deployment', () => {
    const manifest = buildSourceManifest()
    expect(manifest.providerId).toBe('dev.acryl.dshstore')
    expect(manifest.manifestVersion).toBe('1.0.0')
    expect(manifest.transport).toEqual({
      kind: 'https-json',
      endpoint: 'https://acryldev.github.io/store/v1/plugins',
      method: 'GET',
    })
    expect(manifest.query).toEqual({ supported: [], defaultLimit: PAGE_LIMIT, maxLimit: PAGE_LIMIT, sorts: [] })
    expect(MANIFEST_URL).toBe('https://acryldev.github.io/store/.well-known/dsh-store-catalog-source.json')
  })
})
