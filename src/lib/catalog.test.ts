import { describe, expect, it } from 'vitest'
import {
  acrylPackages,
  assetUrl,
  catalog,
  filterPlugins,
  findPlugin,
  installCommand,
  isAcrylPackage,
  packagePath,
  repositorySlug,
  sortPlugins,
} from './catalog'

describe('catalog data layer', () => {
  it('loads the consolidated catalog document', () => {
    expect(catalog.schemaVersion).toBe(1)
    expect(catalog.plugins.length).toBeGreaterThan(1000)
    expect(catalog.categories.length).toBeGreaterThan(0)
  })

  it('finds the editor plugin case-insensitively', () => {
    const plugin = findPlugin('ACRYL-DSH-Editor-Plugin')
    expect(plugin?.npmPackage).toBe('acryl-dsh-editor-plugin')
    expect(isAcrylPackage(plugin!)).toBe(true)
  })

  it('marks npm:acryl-package entries as ACRYL packages', () => {
    const acryl = acrylPackages()
    expect(acryl.length).toBeGreaterThan(0)
    expect(acryl.some(plugin => plugin.npmPackage === 'acryl-dsh-editor-plugin')).toBe(true)
  })

  it('builds an install command from the aggregator', () => {
    const plugin = findPlugin('acryl-dsh-editor-plugin')!
    expect(installCommand(plugin)).toBe('dsh plugin --profile web add acryl-dsh-editor-plugin')
  })

  it('filters by category and query', () => {
    const themed = filterPlugins(catalog.plugins, '', 'theme')
    expect(themed.every(plugin => plugin.category === 'theme')).toBe(true)
    const editor = filterPlugins(catalog.plugins, 'acryl-dsh-editor', 'all')
    expect(editor.some(plugin => plugin.id === 'acryl-dsh-editor-plugin')).toBe(true)
  })

  it('sorts by name, newest, and stars', () => {
    const byName = sortPlugins(catalog.plugins.slice(0, 50), 'name')
    expect(byName[0].name.localeCompare(byName[1].name)).toBeLessThanOrEqual(0)
    const byNewest = sortPlugins(catalog.plugins.slice(0, 50), 'newest')
    expect((byNewest[0].added ?? '') >= (byNewest[1].added ?? '')).toBe(true)
    const byStars = sortPlugins(catalog.plugins.slice(0, 50), 'stars')
    expect((byStars[0].stars ?? 0) >= (byStars[1].stars ?? 0)).toBe(true)
  })

  it('encodes package ids into routes', () => {
    const plugin = findPlugin('acryl-dsh-editor-plugin')!
    expect(packagePath(plugin)).toBe('/packages/acryl-dsh-editor-plugin')
  })

  it('normalizes repository slugs', () => {
    expect(repositorySlug('git+https://github.com/acryldev/acryl-dsh-editor-plugin.git')).toBe('acryldev/acryl-dsh-editor-plugin')
    expect(repositorySlug('https://github.com/deepseek-ai/deepseek-harness/')).toBe('deepseek-ai/deepseek-harness')
    expect(repositorySlug(null)).toBeNull()
  })

  it('resolves public assets against the deployment base', () => {
    expect(assetUrl('v1/plugins')).toMatch(/\/v1\/plugins$/)
  })
})
