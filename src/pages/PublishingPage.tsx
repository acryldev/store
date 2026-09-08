import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CommandBox } from '../components/CommandBox'

const EXAMPLE_REPO = 'https://github.com/acryldev/acryl-dsh-editor-plugin'
const EXAMPLE_NPM = 'https://www.npmjs.com/package/acryl-dsh-editor-plugin'

function Step({ number, title, children }: { readonly number: string; readonly title: string; readonly children: ReactNode }) {
  return (
    <article className="guide-step">
      <div className="guide-step-number" aria-hidden="true">{number}</div>
      <div className="guide-step-body">
        <h2>{title}</h2>
        {children}
      </div>
    </article>
  )
}

function External({ href, children }: { readonly href: string; readonly children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>
}

export function PublishingPage() {
  return (
    <div className="publishing page-width">
      <header className="publishing-header">
        <p className="eyebrow">PUBLISHING GUIDE</p>
        <h1>Get your package <em>into the store</em>.</h1>
        <p className="publishing-lede">
          The store discovers packages automatically — there is no signup and no submission form. Publish an npm
          package with the right keywords and the next daily aggregation lists it. This guide walks through the
          exact path our own reference plugin took, using{' '}
          <External href={EXAMPLE_REPO}>acryl-dsh-editor-plugin</External> as the worked example.
        </p>
        <div className="publishing-example-links">
          <a className="button secondary" href={EXAMPLE_REPO} target="_blank" rel="noreferrer">
            Example repository <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="button secondary" href={EXAMPLE_NPM} target="_blank" rel="noreferrer">
            Example on npm <ArrowUpRight aria-hidden="true" />
          </a>
          <Link className="button secondary" to="/packages/acryl-dsh-editor-plugin">Example in the store</Link>
        </div>
      </header>

      <section className="guide-steps">
        <Step number="1" title="Build a DSH plugin">
          <p>
            A DSH plugin is an npm package the DeepSeek Harness client can mount. The minimum is a{' '}
            <code>dsh.client</code> block in <code>package.json</code> declaring which client capabilities the
            plugin injects and which platform it targets, plus the compiled entry points whitelisted in{' '}
            <code>files</code>. The reference plugin is a Cordis function plugin that registers a VS Code-style
            editor view (file tree, Monaco, ripgrep search, Markdown preview, git diff) — read its{' '}
            <External href={EXAMPLE_REPO}>README</External> for the full implementation walkthrough.
          </p>
          <pre className="guide-code"><code>{`{
  "name": "acryl-dsh-editor-plugin",
  "version": "0.2.3",
  "files": ["lib", "cordis.patch.yml"],
  "publishConfig": { "access": "public" },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "inject": [
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-ui-theme",
        "@deepseek-ai/dsh-client-ui-conversation",
        "@deepseek-ai/dsh-client-ui-settings"
      ],
      "platform": "web"
    }
  }
}`}</code></pre>
        </Step>

        <Step number="2" title="Tag it for discovery">
          <p>
            The aggregator finds packages by npm keyword — that is the whole discovery mechanism. Tag your package{' '}
            <code>dsh-plugin</code> to appear in the DSH ecosystem listings, and additionally{' '}
            <code>acryl-package</code> to be highlighted as an ACRYL package across the UI and the market catalog.
            The reference plugin ships{' '}
            <code>"keywords": ["acryl-package", "dsh-plugin", "dsh", "editor", "monaco"]</code>.
          </p>
        </Step>

        <Step number="3" title="Point to your repository">
          <p>
            Set the <code>repository</code> field so the catalog can resolve your GitHub source. That is what fills
            in stars, last-push dates, and repository provenance on your package page — entries without it stay
            browse-only cards. The reference plugin points at{' '}
            <External href={EXAMPLE_REPO}>acryldev/acryl-dsh-editor-plugin</External>.
          </p>
        </Step>

        <Step number="4" title="Publish to npm">
          <p>
            Publish a public package. <code>publishConfig.access: "public"</code> in the manifest makes scoped
            packages public without extra flags:
          </p>
          <CommandBox command="npm publish --access public" label="Publish" />
        </Step>

        <Step number="5" title="You're in the store">
          <p>
            Nothing else to do — the store re-aggregates every day at 03:37 UTC, picking up every npm package
            carrying the <code>dsh-plugin</code> keyword, de-duplicating it against the community catalogs, and
            republishing the site and the DSH Desktop market catalog. Your listing — and its{' '}
            <code>dsh plugin add</code> command — simply appears:
          </p>
          <CommandBox command="dsh plugin --profile web add acryl-dsh-editor-plugin" label="Install the example" />
        </Step>
      </section>

      <section className="guide-cta">
        <h2>See it live</h2>
        <p>
          The reference plugin is featured on the <Link to="/packages">directory</Link>, listed on{' '}
          <Link to="/packages/acryl-dsh-editor-plugin">its own page</Link>, and installable straight from the
          market catalog endpoint.
        </p>
        <Link className="button" to="/packages">Browse packages</Link>
      </section>
    </div>
  )
}
