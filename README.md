# DSH Store

The biggest **updatable** collection of DSH & ACRYL packages that we maintain.

DSH Store is a consolidated, independent catalog of packages for DeepSeek Harness (DSH)
and ACRYL. It aggregates every discovery surface we could automate and republishes the
result as an alternative catalog source — both as this website and as a DSH Desktop market
catalog source.

**Live:** https://acryldev.github.io/store · **Redirect:** https://acryl.dev/store

## Catalog sources

| Source | What it provides |
| --- | --- |
| `npm:acryl-package` | Every npm package tagged with the `acryl-package` keyword (ACRYL ecosystem) |
| `npm:dsh-plugin` | Every npm package tagged with the `dsh-plugin` keyword (DSH ecosystem) |
| `1024store` | The 1024store community catalog |
| `awesome-dsh-plugin` | The awesome-dsh-plugin curated list (EN/ZH descriptions) |
| `github-topic` | GitHub repositories tagged `dsh-plugin` / `dsh` |
| `composio` | Composio seed catalog |

The aggregator de-duplicates entries across sources and keeps per-entry provenance
(`sources`), so a package's page always shows where it was discovered. `acryl-package`
entries are highlighted as ACRYL packages throughout the UI.

## Data artifacts

- `src/data/consolidated-catalog.json` — full merged catalog consumed by the site (static data layer)
- `public/v1/plugins` — DSH Desktop market catalog endpoint (schema 1.0.0, 50-item pages)
- `public/.well-known/dsh-store-catalog-source.json` — catalog source manifest for Desktop market registration

## Regenerating the catalog

```sh
pnpm install
pnpm aggregate   # refetches all sources and rewrites consolidated-catalog.json + public artifacts
pnpm check       # typecheck + tests + build
```

A GitHub Actions workflow re-runs aggregation on a schedule and republishes the site,
so the collection stays up to date without manual work.

## Installing packages

Packages with a published npm package can be installed through the DSH plugin CLI:

```sh
dsh plugin --profile web add <package-name>
```

For example, the ACRYL DSH Editor plugin:

```sh
dsh plugin --profile web add acryl-dsh-editor-plugin
```

## Publishing your own package

Store discovery is automatic: publish an npm package tagged with the `dsh-plugin`
keyword (add `acryl-package` for an ACRYL ecosystem highlight) and the daily
aggregation lists it — no signup, no submission form. The full walkthrough, using
[`acryl-dsh-editor-plugin`](https://github.com/acryldev/acryl-dsh-editor-plugin)
([npm](https://www.npmjs.com/package/acryl-dsh-editor-plugin)) as the worked
example, lives at **https://acryl.dev/store/publishing**.

## Security scanning

Store aggregation is descriptive, not an endorsement. Review a package's source before
installing it. Automated security scanning of catalog entries is planned for this catalog —
the consolidated catalog already keeps enough metadata (registry, repository, versions,
provenance) to drive it.

## Development

```sh
pnpm dev      # dev server at /store/
pnpm check    # typecheck + tests + production build
```

Independent community project. Not affiliated with DeepSeek.
