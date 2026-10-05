import { createServer, type IncomingHttpHeaders, type ServerResponse } from 'node:http'
import { pathToFileURL } from 'node:url'
import { handleRequest } from './app.ts'
import { PORT } from './config.ts'

export const server = createServer(async (incoming, outgoing) => {
  const headers = toWebHeaders(incoming.headers)
  const origin = `http://${headers.get('host') ?? 'localhost'}`
  const request = new Request(new URL(incoming.url ?? '/', origin), {
    method: incoming.method,
    headers,
  })
  const response = await handleRequest(request)
  await sendResponse(response, outgoing, incoming.method === 'HEAD')
})

export function startServer(): void {
  server.listen(PORT, '0.0.0.0', () => {
    console.info(`Server listening at http://localhost:${PORT}`)
  })
}

function toWebHeaders(incomingHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers()
  for (const [name, value] of Object.entries(incomingHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item)
    } else if (value !== undefined) {
      headers.set(name, value)
    }
  }
  return headers
}

async function sendResponse(response: Response, outgoing: ServerResponse, isHeadRequest: boolean): Promise<void> {
  outgoing.statusCode = response.status
  response.headers.forEach((value, name) => {
    outgoing.setHeader(name, value)
  })

  if (isHeadRequest || !response.body) {
    outgoing.end()
    return
  }

  outgoing.end(Buffer.from(await response.arrayBuffer()))
}

function closeGracefully(signal: string): void {
  console.info(`Received signal to terminate: ${signal}`)
  server.close(() => process.exit())
}
process.on('SIGINT', closeGracefully)
process.on('SIGTERM', closeGracefully)

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer()
}
