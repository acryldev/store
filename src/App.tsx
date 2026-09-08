import { Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { HomePage } from './pages/HomePage'
import { PackagePage } from './pages/PackagePage'
import { PackagesPage } from './pages/PackagesPage'
import { PublishingPage } from './pages/PublishingPage'

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="packages/:id" element={<PackagePage />} />
        <Route path="publishing" element={<PublishingPage />} />
        <Route path="*" element={<div className="not-found page-width"><span>404</span><h1>Page not found.</h1></div>} />
      </Route>
    </Routes>
  )
}
