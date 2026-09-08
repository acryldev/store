import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource-variable/space-grotesk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles.css'

// GitHub Pages serves index.html for unknown paths (404.html redirect shim);
// restore the deep-linked route before the router mounts.
const redirectedPath = sessionStorage.getItem('dsh-store-redirect')
if (redirectedPath) {
  sessionStorage.removeItem('dsh-store-redirect')
  history.replaceState(null, '', redirectedPath)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
