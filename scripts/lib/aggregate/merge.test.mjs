import { describe, expect, it } from 'vitest'

import { mergeEntries } from './merge.mjs'

const GENERATED_AT = '2026-09-08T00:00:00.000Z'

function raw(overrides = {}) {
  return {
    repository: null,
    npmPackage: null,
    name: null,
    category: null,
    description: null,
    stars: null,
    added: null,
    pushedAt: null,
    source: '1024store',
    ...overrides,
  }
}

describe('mergeEntries', () => {
  it('deduplicates by repository identity, keeping one entry', () => {
    const { plugins } = mergeEntries([
      raw({ repository: 'https://github.com/A/B', name: 'B', source: 'npm:dsh-plugin', stars: 10 }),
      raw({ repository: 'https://github.com/a/b', name: 'b (store)', source: '1024store', stars: 3 }),
    ], GENERATED_AT)
    expect(plugins).toHaveLength(1)
    expect(plugins[0].id).toBe('a/b')
  })

  it('falls back to the npm name as identity when no repository is known', () => {
    const { plugins } = mergeEntries([
      raw({ npmPackage: 'dsh-editor', source: 'npm:acryl-package' }),
      raw({ npmPackage: 'dsh-editor', source: 'npm:dsh-plugin' }),
    ], GENERATED_AT)
    expect(plugins).toHaveLength(1)
    expect(plugins[0].id).toBe('dsh-editor')
  })

  it('accumulates distinct source provenance without duplicates', () => {
    const { plugins } = mergeEntries([
      raw({ repository: 'https://github.com/a/b', source: 'npm:dsh-plugin' }),
      raw({ repository: 'https://github.com/a/b', source: '1024store' }),
      raw({ repository: 'https://github.com/a/b', source: '1024store' }),
    ], GENERATED_AT)
    expect(plugins[0].sources).toEqual(['npm:dsh-plugin', '1024store'])
  })

  it('keeps the maximum star count and the earliest added date', () => {
    const { plugins } = mergeEntries([
      raw({ npmPackage: 'p1', stars: 5, added: '2026-02-01' }),
      raw({ npmPackage: 'p1', stars: 99, added: '2025-06-15' }),
    ], GENERATED_AT)
    expect(plugins[0].stars).toBe(99)
    expect(plugins[0].added).toBe('2025-06-15')
  })

  it('merges bilingual descriptions preferring longer text and fills languages', () => {
    const { plugins } = mergeEntries([
      raw({ npmPackage: 'p1', description: { en: 'short' } }),
      raw({ npmPackage: 'p1', description: { en: 'a longer english text', zh: '中文' } }),
    ], GENERATED_AT)
    expect(plugins[0].description).toEqual({ en: 'a longer english text', zh: '中文' })
  })

  it('treats a plain-string description as english', () => {
    const { plugins } = mergeEntries([raw({ npmPackage: 'p1', description: 'plain text' })], GENERATED_AT)
    expect(plugins[0].description).toEqual({ en: 'plain text' })
  })

  it('keeps the first seen category and computes the install command', () => {
    const { plugins } = mergeEntries([
      raw({ repository: 'https://github.com/a/b', category: 'ui' }),
      raw({ repository: 'https://github.com/a/b', category: 'ignored-later', npmPackage: 'b-pkg' }),
    ], GENERATED_AT)
    expect(plugins[0].category).toBe('ui')
    expect(plugins[0].npmPackage).toBe('b-pkg')
    expect(plugins[0].install).toBe('dsh plugin --profile web add b-pkg')
  })

  it('sorts by stars descending, then id ascending', () => {
    const { plugins } = mergeEntries([
      raw({ npmPackage: 'zz-low', stars: 1 }),
      raw({ npmPackage: 'aa-high', stars: 50 }),
      raw({ npmPackage: 'mm-high', stars: 50 }),
    ], GENERATED_AT)
    expect(plugins.map(plugin => plugin.id)).toEqual(['aa-high', 'mm-high', 'zz-low'])
  })

  it('collects sorted distinct categories', () => {
    const { categories } = mergeEntries([
      raw({ npmPackage: 'p1', category: 'vision' }),
      raw({ npmPackage: 'p2', category: 'ui' }),
      raw({ npmPackage: 'p3', category: null }),
    ], GENERATED_AT)
    expect(categories).toEqual(['ui', 'vision'])
  })

  it('skips entries with no identity and reports the generatedAt', () => {
    const merged = mergeEntries([raw({ npmPackage: 'not a name!' }), raw({})], GENERATED_AT)
    expect(merged.plugins).toHaveLength(0)
    expect(merged.generatedAt).toBe(GENERATED_AT)
    expect(merged.categories).toEqual([])
  })
})
