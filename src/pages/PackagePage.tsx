import { ArrowLeft, Box, ShieldAlert, ShieldCheck, Star, Tag } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CommandBox } from '../components/CommandBox'
import {
  findPlugin,
  installCommand,
  isAcrylPackage,
  repositorySlug,
} from '../lib/catalog'

function formatCompact(value: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function PackagePage() {
  const params = useParams()
  const plugin = params.id ? findPlugin(params.id) : undefined

  if (!plugin) {
    return (
      <div className="not-found page-width">
        <span>404</span>
        <h1>Package not found.</h1>
        <p className="not-found-lede">The package may not be aggregated yet, or its id changed.</p>
        <Link className="button" to="/packages">Return to packages</Link>
      </div>
    )
  }

  const command = installCommand(plugin)
  const acryl = isAcrylPackage(plugin)
  const repo = repositorySlug(plugin.repository)
  return (
    <div className="package-detail page-width">
      <Link className="back-link" to="/packages"><ArrowLeft aria-hidden="true" />All packages</Link>
      <header className="package-header">
        <div className="package-header-main">
          <p className="eyebrow">{acryl ? 'ACRYL package ecosystem' : 'DSH plugin ecosystem'}</p>
          <h1><Box aria-hidden="true" />{plugin.name}</h1>
          <p className="package-lede">{plugin.description.en ?? plugin.description.zh ?? 'No description provided.'}</p>
          <div className="detail-tags">
            <span className="detail-tag"><Tag aria-hidden="true" />{plugin.category ?? 'uncategorized'}</span>
            {plugin.added && <span className="detail-tag">{plugin.added}</span>}
            {plugin.stars !== null && <span className="detail-tag"><Star aria-hidden="true" />{formatCompact(plugin.stars)} stars</span>}
            <span className="detail-tag">{plugin.sources.length} sources</span>
          </div>
        </div>
      </header>

      <div className="package-layout">
        <div className="package-body">
          <div className="install-panel">
            <div className="panel-heading"><ShieldCheck aria-hidden="true" /><h2>Install</h2></div>
            {command ? (
              <CommandBox command={command} />
            ) : (
              <p className="install-note">
                No npm package is published for this entry yet. Install is only available once the author publishes it to npm
                and it carries the <code>dsh-plugin</code> keyword.
              </p>
            )}
          </div>
          <div className="compatibility-panel">
            <div className="panel-heading"><ShieldCheck aria-hidden="true" /><h2>Compatibility</h2></div>
            <div className="compatibility-rows">
              <div className="compatibility-row">
                <strong>DeepSeek Harness native</strong>
                <span>Cordis plugin mounted through the DSH plugin CLI. <code>{command ?? plugin.id}</code></span>
              </div>
              <div className="compatibility-row">
                <strong>Cordis inspect</strong>
                <span>Inspect the bundle with <code>dsh inspect {plugin.id}</code>.</span>
              </div>
              <div className="compatibility-row">
                <strong>ACRYL Desktop</strong>
                <span>{acryl ? 'ACRYL ecosystem package.' : 'Not yet verified against ACRYL Desktop profiles.'}</span>
              </div>
            </div>
          </div>
          <div className="security-callout">
            <ShieldAlert aria-hidden="true" />
            <p>
              Store aggregation is descriptive, not an endorsement. Review a package's source before installing it —
              automated security scanning is planned for this catalog.
            </p>
          </div>
        </div>
        <aside className="package-aside">
          <div className="aside-panel">
            <h3>SOURCE</h3>
            <dl>
              <dt>Registry</dt>
              <dd>{plugin.npmPackage ? 'npm' : 'GitHub'}</dd>
              <dt>Package</dt>
              <dd>{plugin.npmPackage ?? '—'}</dd>
              <dt>Repository</dt>
              <dd>{repo ? <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">{repo}</a> : 'Unlisted'}</dd>
              <dt>Discovery sources</dt>
              <dd>{plugin.sources.join(', ')}</dd>
              {plugin.added && (<><dt>Added</dt><dd>{plugin.added}</dd></>)}
              {plugin.pushedAt && (<><dt>Last push</dt><dd>{plugin.pushedAt.slice(0, 10)}</dd></>)}
              <dt>Install status</dt>
              <dd>{command ? 'npm package published' : 'Browse only'}</dd>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
