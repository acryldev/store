import { describe, expect, it } from 'vitest'

import {
  earliestDate,
  entryIdentity,
  firstText,
  installCommand,
  isNpmName,
  mergeDescription,
  normalizeRepository,
  repoIdentity,
} from './normalize.mjs'

describe('normalizeRepository', () => {
  it('passes through GitHub https URLs', () => {
    expect(normalizeRepository('https://github.com/omdsh-dev/dsh-genui')).toBe('https://github.com/omdsh-dev/dsh-genui')
  })

  it('converts owner/repo shorthand into a GitHub URL', () => {
    expect(normalizeRepository('omdsh-dev/dsh-genui')).toBe('https://github.com/omdsh-dev/dsh-genui')
  })

  it('rejects non-GitHub URLs and junk', () => {
    expect(normalizeRepository('https://gitlab.com/a/b')).toBeNull()
    expect(normalizeRepository('not a repo')).toBeNull()
    expect(normalizeRepository(42)).toBeNull()
    expect(normalizeRepository('  ')).toBeNull()
  })
})

describe('repoIdentity', () => {
  it('lowercases owner and repo', () => {
    expect(repoIdentity('https://github.com/Omdsh-Dev/DSH-Genui')).toBe('omdsh-dev/dsh-genui')
  })

  it('strips .git and query suffixes', () => {
    expect(repoIdentity('https://github.com/a/b.git')).toBe('a/b')
    expect(repoIdentity('https://github.com/a/b?tab=readme')).toBe('a/b')
  })

  it('returns null for non-GitHub input', () => {
    expect(repoIdentity('https://gitlab.com/a/b')).toBeNull()
    expect(repoIdentity(null)).toBeNull()
  })
})

describe('isNpmName', () => {
  it('accepts plain and scoped npm names', () => {
    expect(isNpmName('dsh-editor')).toBe(true)
    expect(isNpmName('@acryl/dsh-editor')).toBe(true)
  })

  it('rejects invalid names', () => {
    expect(isNpmName('UpperCase')).toBe(false)
    expect(isNpmName('')).toBe(false)
    expect(isNpmName(null)).toBe(false)
  })
})

describe('entryIdentity', () => {
  it('prefers the repository identity over the npm name', () => {
    expect(entryIdentity({ repository: 'https://github.com/A/B', npmPackage: 'pkg' })).toBe('a/b')
  })

  it('falls back to the npm name when no repository is known', () => {
    expect(entryIdentity({ repository: null, npmPackage: 'dsh-editor' })).toBe('dsh-editor')
  })

  it('returns null when neither identity exists', () => {
    expect(entryIdentity({ repository: null, npmPackage: null })).toBeNull()
  })
})

describe('firstText', () => {
  it('returns the first non-empty trimmed string', () => {
    expect(firstText(null, '  ', 'value', 'other')).toBe('value')
    expect(firstText()).toBeNull()
  })
})

describe('mergeDescription', () => {
  it('keeps the longer text per language', () => {
    const merged = mergeDescription(
      { en: 'short', zh: '中文描述' },
      { en: 'a much longer english description', zh: '短' },
    )
    expect(merged).toEqual({ en: 'a much longer english description', zh: '中文描述' })
  })

  it('fills missing languages', () => {
    expect(mergeDescription({}, { en: 'hello' })).toEqual({ en: 'hello' })
    expect(mergeDescription({ en: 'kept' }, { zh: '添加' })).toEqual({ en: 'kept', zh: '添加' })
  })

  it('ignores non-string additions', () => {
    expect(mergeDescription({ en: 'x' }, null)).toEqual({ en: 'x' })
  })
})

describe('earliestDate', () => {
  it('returns the earliest valid YYYY-MM-DD value', () => {
    expect(earliestDate('2026-03-05', null, '2025-12-01')).toBe('2025-12-01')
  })

  it('ignores invalid formats and returns null when nothing is valid', () => {
    expect(earliestDate('March 2026', 123, null)).toBeNull()
  })
})

describe('installCommand', () => {
  it('uses the npm package when present', () => {
    expect(installCommand({ npmPackage: 'dsh-editor', repository: 'https://github.com/a/b' }))
      .toBe('dsh plugin --profile web add dsh-editor')
  })

  it('falls back to the owner/repo identity', () => {
    expect(installCommand({ npmPackage: null, repository: 'https://github.com/omdsh-dev/dsh-genui' }))
      .toBe('dsh plugin --profile web add omdsh-dev/dsh-genui')
  })

  it('returns null when neither identity exists', () => {
    expect(installCommand({ npmPackage: null, repository: null })).toBeNull()
  })
})
