import { describe, expect, it } from 'vitest'
import { FEATURED, featuredEntry, featuredPlugins } from './featured'

describe('featured', () => {
  it('resolves every curated id to a catalog entry', () => {
    const resolved = featuredPlugins()
    expect(resolved).toHaveLength(FEATURED.length)
    expect(resolved[0].plugin.id).toBe('acryl-dsh-editor-plugin')
    expect(resolved[0].plugin.npmPackage).toBe('acryl-dsh-editor-plugin')
    expect(resolved[0].entry.badge).toBe('Featured')
  })

  it('matches ids case-insensitively', () => {
    expect(featuredEntry('ACRYL-DSH-EDITOR-PLUGIN')).toBeDefined()
    expect(featuredEntry('some-other-plugin')).toBeUndefined()
  })
})
