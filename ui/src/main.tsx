import './runtime-shim.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ExplorerPage } from '@open-resource-discovery/explorer/components'
import '@open-resource-discovery/explorer/components/styles'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const ordConfigUrl = new URL('/.well-known/open-resource-discovery', window.location.origin).href

createRoot(rootElement).render(
  <StrictMode>
    <div className="reference-app">
      <header className="reference-app__intro">
        <div className="reference-app__copy">
          <p className="reference-app__eyebrow">ORD reference implementation</p>
          <h1>Explore a live ORD Provider</h1>
          <p>
            This TypeScript application exposes APIs, events, and their metadata through Open Resource Discovery.
            The Explorer below loads the public <code>system-version</code> perspective directly from this Provider.
          </p>
        </div>
        <nav aria-label="Reference application links">
          <a href="/.well-known/open-resource-discovery">ORD configuration</a>
          <a href="https://github.com/open-resource-discovery/reference-application">Source code ↗</a>
          <a href="https://open-resource-discovery.org/">ORD specification ↗</a>
        </nav>
      </header>
      <main>
        <ExplorerPage
          ordConfigUrl={ordConfigUrl}
          perspectiveId="system-version"
          className="reference-app__explorer"
          enableUrlSync
        />
      </main>
    </div>
  </StrictMode>,
)
