// Source: ACRYL editorial seed - first-party plugins ACRYL publishes and
// vouches for. These also aggregate from npm once published; the seed keeps
// them in the catalog immediately and carries the canonical description.
// Refreshed by hand.

/** @type {Array<{npmPackage: string, repository: string|null, name: string, description: {en: string, zh?: string}}>} */
const SEED = [
  {
    npmPackage: 'cordis-plugin-graph',
    // repository left null so the merged identity keys on the npm name
    // (matching acryl-dsh-editor-plugin); npm metadata backfills the repo link.
    repository: null,
    name: 'cordis-plugin-graph',
    description: {
      en: "Adds a 'Plugin graph' tab to Settings: a live, zoomable Cytoscape graph of the running Cordis context. Plugin fibers as phase-coloured nodes; toggleable inject-dependency, resolved-provider, and Loader-tree-nesting edges.",
      zh: '在设置中新增“插件关系图”标签页：用 Cytoscape 实时渲染可缩放的 Cordis 上下文关系图。插件 fiber 为按生命周期状态着色的节点，可切换显示 inject 依赖、已解析的 provider、以及 Loader 树的嵌套关系。',
    },
  },
]

/** Yields raw entries for the ACRYL first-party seed list. */
export async function fetchAcrylSeed() {
  return SEED.map(entry => ({
    repository: entry.repository,
    npmPackage: entry.npmPackage,
    name: entry.name,
    category: 'dev',
    description: entry.description,
    stars: null,
    added: null,
    pushedAt: null,
    source: 'acryl-seed',
  }))
}
