import './runtime-shim.ts'
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ExplorerPage } from '@open-resource-discovery/explorer/components'
import '@open-resource-discovery/explorer/components/styles'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const ordConfigUrl = new URL('/.well-known/open-resource-discovery', window.location.origin).href
const systemInstancePath = '/open-resource-discovery/v1/documents/system-instance'
const demoAuthorization = `Basic ${btoa('foo:bar')}`
const browserFetch = window.fetch.bind(window)

window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const requestUrl = new URL(input instanceof Request ? input.url : input.toString(), window.location.origin)
  if (requestUrl.origin !== window.location.origin || requestUrl.pathname !== systemInstancePath) {
    return browserFetch(input, init)
  }

  const headers = new Headers(input instanceof Request ? input.headers : undefined)
  if (init?.headers) {
    new Headers(init.headers).forEach((value, name) => headers.set(name, value))
  }
  headers.set('Authorization', demoAuthorization)

  return browserFetch(input, { ...init, headers })
}

type Perspective = 'system-version' | 'system-instance'

function ReferenceApplication() {
  const [perspective, setPerspective] = useState<Perspective>('system-version')

  return (
    <div className="reference-app">
      <header className="reference-app__intro">
        <div className="reference-app__copy">
          <p className="reference-app__eyebrow">ORD reference implementation</p>
          <h1>Explore a live ORD reference application</h1>
          <p>
            This runnable TypeScript example acts as an ORD Provider for APIs and events, while the embedded ORD
            Explorer acts as a Consumer that discovers and renders its catalog. Compare the public system-version
            metadata with tenant <code>T1</code> through the authenticated system-instance perspective below.
          </p>
        </div>
        <nav aria-label="Reference application links">
          <a href="/.well-known/open-resource-discovery">Discovery entry point</a>
          <a href="https://github.com/open-resource-discovery/reference-application">Source &amp; guide ↗</a>
          <a href="https://github.com/open-resource-discovery/explorer">Explorer project ↗</a>
          <a href="https://open-resource-discovery.org/docs/introduction#metadata-discovery-protocol">
            Discovery flow ↗
          </a>
        </nav>
      </header>
      <section className="reference-app__perspectives" aria-label="ORD perspective">
        <span>Perspective</span>
        <div role="group" aria-label="Choose an ORD perspective">
          <button
            type="button"
            aria-pressed={perspective === 'system-version'}
            onClick={() => setPerspective('system-version')}
          >
            System version
          </button>
          <button
            type="button"
            aria-pressed={perspective === 'system-instance'}
            onClick={() => setPerspective('system-instance')}
          >
            System instance
          </button>
        </div>
        <p>
          {perspective === 'system-version' ? (
            <>Static metadata for this application version. It is public and needs no credentials.</>
          ) : (
            <>
              Run-time metadata for one concrete instance or tenant. This demo adds Basic Auth <code>foo / bar</code>
              to the ORD document request, selecting tenant <code>T1</code>.
            </>
          )}{' '}
          <a href="https://open-resource-discovery.org/spec-v1/concepts/perspectives#dynamic-perspective">
            About perspectives ↗
          </a>
        </p>
      </section>
      <main>
        <ExplorerPage
          key={perspective}
          ordConfigUrl={ordConfigUrl}
          perspectiveId={perspective}
          className="reference-app__explorer"
          enableUrlSync
        />
      </main>
    </div>
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <ReferenceApplication />
  </StrictMode>,
)
