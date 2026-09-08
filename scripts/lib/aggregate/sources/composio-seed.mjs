// Source: one-time seed list from the composio.dev editorial roundup
// "best-deepseek-harness-plugins". Captured 2026-09-08; refreshed by hand.
/** @type {Array<{repository: string|null, note: string}>} */
const SEED = [
  { repository: 'https://github.com/zhu1090093659/dsh-web-ui', note: 'UI plugin bundle: task board, Git graph, mobile access, skins, SSH tools, desktop pet.' },
  { repository: 'https://github.com/omdsh-dev/DSH-better-sidebar', note: 'File explorer, real terminal, Git views, browser tabs, subagent views beside the chat.' },
  { repository: 'https://github.com/liustack/modlens', note: 'Gives text-only DeepSeek models vision via structured OCR and image analysis.' },
  { repository: 'https://github.com/Anionex/dsh-vision-toolkit', note: 'Advanced visual workflows: long-screenshot OCR, grounding, cropping, UI reconstruction.' },
  { repository: 'https://github.com/ccch1mneyyy/dsh-TUI', note: 'Full-screen, keyboard-first terminal interface with streaming output and session navigation.' },
  { repository: 'https://github.com/omdsh-dev/dsh-at-file', note: 'Searchable @ file and folder references in the Web UI prompt composer.' },
  { repository: 'https://github.com/dsh-market/dsh-market', note: 'In-app plugin marketplace for browsing, installing, updating, removing, backing up plugins.' },
  { repository: 'https://github.com/awesome-dsh-plugin/dsh-find-plugin', note: 'Agent searches GitHub repos tagged with the dsh-plugin topic; star-ranked install results.' },
  { repository: 'https://github.com/omdsh-dev/dsh-genui', note: 'Models render 30+ interactive components inside replies; actions feed events back.' },
  { repository: 'https://github.com/omdsh-dev/dsh-mnemon', note: 'Cross-session memory layer: runtime preferences, project documents, searchable Memory Spaces.' },
]

/** Yields raw entries for the composio.dev editorial seed list. */
export async function fetchComposioSeed() {
  return SEED.map(({ repository, note }) => ({
    repository,
    npmPackage: null,
    name: repository?.split('/').pop() ?? null,
    category: null,
    description: { en: note },
    stars: null,
    added: null,
    pushedAt: null,
    source: 'composio',
  }))
}
