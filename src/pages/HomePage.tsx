import { ArrowRight, ArrowUpRight, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { acrylPackages, assetUrl, catalog, formatCompact } from '../lib/catalog'
import { featuredEntry } from '../lib/featured'

function sourceLabel(id: string): string {
  if (id.startsWith('npm:')) return `npm keyword “${id.slice(4)}”`
  return id
}

export function HomePage() {
  const acryl = acrylPackages().slice(0, 4)
  const okSources = catalog.sources.filter(source => source.ok)
  return (
    <div className="home">
      <section className="home-hero grid-surface">
        <p className="eyebrow">DSH STORE</p>
        <h1>
          The biggest <strong>updatable</strong> collection of DSH &amp; ACRYL packages that we maintain.
        </h1>
        <p className="home-lede">
          A consolidated, independent catalog of DeepSeek Harness (DSH) and ACRYL packages — aggregated from npm keywords,
          community catalogs, and GitHub topics, and republished as an alternative catalog source for DSH Desktop and ACRYL.
        </p>
        <div className="hero-cta">
          <Link className="button" to="/packages">
            Browse packages <ArrowRight aria-hidden="true" />
          </Link>
          <a className="button secondary" href={assetUrl('.well-known/dsh-store-catalog-source.json')}>
            Catalog manifest <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="directory-section page-width">
        <div className="directory-section-heading">
          <p className="eyebrow">SOURCES</p>
          <h2>Aggregated from {okSources.length} live sources</h2>
        </div>
        <div className="recent-grid">
          {catalog.sources.map(source => (
            <div className="recent-card" key={source.id}>
              <strong>{source.id}</strong>
              <p>{source.count.toLocaleString('en')} raw entries</p>
              <span className={source.ok ? 'origin-chip' : 'origin-chip acryl'}>{source.ok ? 'live' : 'failed'}</span>
              <span className="card-meta">{sourceLabel(source.id)}</span>
            </div>
          ))}
        </div>
      </section>

      {acryl.length > 0 && (
        <section className="directory-section page-width">
          <div className="directory-section-heading">
            <p className="eyebrow">ACRYL PACKAGES</p>
            <h2>Maintained for the ACRYL ecosystem</h2>
          </div>
          <div className="recent-grid">
            {acryl.map(plugin => (
              <Link className="recent-card" to={`/packages/${encodeURIComponent(plugin.id)}`} key={plugin.id}>
                <strong><Package aria-hidden="true" />{plugin.name}</strong>
                <p>{plugin.description.en ?? plugin.description.zh ?? 'No description provided.'}</p>
                {featuredEntry(plugin.id) && <span className="origin-chip featured">Featured</span>}
                <span className="origin-chip acryl">ACRYL</span>
                <span className="card-meta">
                  {plugin.stars !== null && `${formatCompact(plugin.stars)} stars · `}
                  {plugin.sources.length} sources
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="final-cta">
        <p className="eyebrow">GET STARTED</p>
        <h2>Point your catalog client at the store</h2>
        <div className="hero-cta">
          <Link className="button" to="/packages">
            Browse {catalog.plugins.length.toLocaleString('en')} packages <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="button secondary" to="/publishing">
            Publish your own package <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
