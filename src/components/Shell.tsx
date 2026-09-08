import { Github, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { catalog, assetUrl } from '../lib/catalog'
import { Brand } from './Brand'
import { ThemeToggle } from './ThemeToggle'

export function Shell() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <button className="mobile-menu" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav className={open ? 'site-nav open' : 'site-nav'} aria-label="Primary">
            <NavLink to="/" end onClick={close}>Store</NavLink>
            <NavLink to="/packages" onClick={close}>Packages</NavLink>
            <a href="https://github.com/acryldev/store" target="_blank" rel="noreferrer" className="community-link">
              <Github aria-hidden="true" />Source
            </a>
          </nav>
          <div className="header-actions">
            <a className="icon-button" href="https://github.com/acryldev/store" target="_blank" rel="noreferrer" aria-label="DSH Store on GitHub">
              <Github aria-hidden="true" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>The biggest updatable DSH &amp; ACRYL package collection that we maintain — aggregated from npm, community catalogs, and GitHub, and republished as an alternative catalog source.</p>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/packages">Packages</Link>
          <a href="https://acryl.dev/packages" target="_blank" rel="noreferrer">acryl.dev</a>
          <a href="https://github.com/deepseek-ai/deepseek-harness" target="_blank" rel="noreferrer">DeepSeek Harness</a>
          <a href={assetUrl('v1/plugins')}>Catalog API</a>
        </nav>
        <p className="footer-note">
          Independent community aggregation. Not affiliated with DeepSeek.
          Catalog generated {catalog.generatedAt.slice(0, 10)} · {catalog.plugins.length.toLocaleString('en')} packages · {catalog.sources.filter(source => source.ok).length} live sources.
        </p>
      </footer>
    </div>
  )
}
