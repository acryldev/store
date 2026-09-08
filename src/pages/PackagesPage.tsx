import { useDeferredValue, useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Copy, Database, PackageSearch, Search, ShieldCheck, Sparkles, Star, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  assetUrl,
  catalog,
  filterPlugins,
  installCommand,
  isAcrylPackage,
  packagePath,
  sortPlugins,
} from '../lib/catalog'
import type { CatalogPlugin, CatalogSort } from '../types'

const PAGE_SIZE = 60

const SORTS: readonly { value: CatalogSort; label: string }[] = [
  { value: 'stars', label: 'Most starred' },
  { value: 'newest', label: 'Recently added' },
  { value: 'name', label: 'A-Z' },
]

function asPage(value: string | null): number {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function asSort(value: string | null): CatalogSort {
  return SORTS.some(option => option.value === value) ? value as CatalogSort : 'stars'
}

function formatCompact(value: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function InstallStrip({ plugin }: { readonly plugin: CatalogPlugin }) {
  const command = installCommand(plugin)
  const [copied, setCopied] = useState(false)
  if (!command) return <div className="browse-only">Browse only</div>
  const copy = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    await navigator.clipboard.writeText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="package-install">
      <code><span aria-hidden="true">$</span>{command}</code>
      <button type="button" onClick={event => void copy(event)} aria-label="Copy install command">
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
    </div>
  )
}

export function PackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? 'all'
  const sort = asSort(searchParams.get('sort'))
  const page = asPage(searchParams.get('page'))
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(
    () => sortPlugins(filterPlugins(catalog.plugins, deferredQuery, category), sort),
    [deferredQuery, category, sort],
  )
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageSlice = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in patch)) next.delete('page')
    setSearchParams(next)
  }
  const reset = () => setSearchParams(new URLSearchParams())

  return (
    <div className="directory">
      <section className="directory-intro page-width">
        <div className="directory-intro-copy">
          <p className="eyebrow">PACKAGE DIRECTORY</p>
          <h1>The DSH &amp; ACRYL <em>package shelf</em>.</h1>
          <p className="directory-lede">
            Every package we can find for DeepSeek Harness and ACRYL — {catalog.plugins.length.toLocaleString('en')} entries
            aggregated from npm keywords, 1024store, awesome-dsh-plugin, GitHub topics, and the composio seed.
          </p>
        </div>
        <div className="directory-trust">
          <span><ShieldCheck aria-hidden="true" />Source-aware aggregation</span>
          <span><Sparkles aria-hidden="true" />Regularly re-aggregated</span>
          <span><Database aria-hidden="true" />{catalog.plugins.length.toLocaleString('en')} packages · schema {catalog.schemaVersion}.0</span>
        </div>
      </section>

      <section className="directory-section page-width">
        <div className="action-bar">
          <label className="search-field">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder="Search packages…"
              onChange={event => update({ q: event.target.value })}
            />
            {query && (
              <button type="button" className="clear-button" aria-label="Clear search" onClick={() => update({ q: '' })}>
                <X aria-hidden="true" />
              </button>
            )}
          </label>
          <select aria-label="Filter by category" value={category} onChange={event => update({ category: event.target.value })}>
            <option value="all">All categories</option>
            {catalog.categories.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select aria-label="Sort packages" value={sort} onChange={event => update({ sort: event.target.value })}>
            {SORTS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {(query || category !== 'all' || sort !== 'stars') && (
            <button type="button" className="reset-button" onClick={reset}>Reset</button>
          )}
        </div>

        {pageSlice.length === 0 ? (
          <div className="empty-state">
            <PackageSearch aria-hidden="true" />
            <h3>No packages match</h3>
            <p>Try a different search or category.</p>
            <button type="button" className="button secondary" onClick={reset}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="discovery-grid">
              {pageSlice.map(plugin => (
                <Link key={plugin.id} className="discovery-card" to={packagePath(plugin)}>
                  <div className="discovery-card-main">
                    <div className="package-mark"><PackageSearch aria-hidden="true" /></div>
                    <div className="discovery-card-copy">
                      <h3>{plugin.name}</h3>
                      <p>{plugin.description.en ?? plugin.description.zh ?? 'No description provided.'}</p>
                      <div className="package-facts">
                        {plugin.stars !== null && <span><Star aria-hidden="true" />{formatCompact(plugin.stars)}</span>}
                        {plugin.npmPackage && <span className="origin-chip">npm</span>}
                        {isAcrylPackage(plugin) && <span className="origin-chip acryl">ACRYL</span>}
                        {plugin.category && <span>{plugin.category}</span>}
                        {plugin.added && <span>{plugin.added}</span>}
                      </div>
                    </div>
                  </div>
                  <InstallStrip plugin={plugin} />
                </Link>
              ))}
            </div>
            <div className="pagination">
              <button type="button" disabled={safePage <= 1} onClick={() => update({ page: String(safePage - 1) })} aria-label="Previous page">
                <ChevronLeft aria-hidden="true" />
              </button>
              <span>Page {safePage} of {pageCount} · {results.length.toLocaleString('en')} packages</span>
              <button type="button" disabled={safePage >= pageCount} onClick={() => update({ page: String(safePage + 1) })} aria-label="Next page">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </section>

      <section className="provenance page-width">
        <Database aria-hidden="true" />
        <p>
          Consolidated catalog generated {catalog.generatedAt.slice(0, 10)} from {catalog.sources.length} sources.{' '}
          <a href={assetUrl('v1/plugins')}>Catalog API</a> ·{' '}
          <a href={assetUrl('.well-known/dsh-store-catalog-source.json')}>Source manifest</a>
        </p>
      </section>
    </div>
  )
}
