import './runtime-shim.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ExplorerPage } from '@open-resource-discovery/explorer/components'
import '@open-resource-discovery/explorer/components/styles'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const ordConfigUrl = new URL('/.well-known/open-resource-discovery', window.location.origin).href

createRoot(rootElement).render(
  <StrictMode>
    <ExplorerPage
      ordConfigUrl={ordConfigUrl}
      perspectiveId="system-version"
      className="h-screen"
      enableUrlSync
    />
  </StrictMode>,
)
