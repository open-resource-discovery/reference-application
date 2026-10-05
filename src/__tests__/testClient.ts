import { handleRequest } from '../app.ts'

interface InjectOptions {
  method: string
  url: string
  headers?: Record<string, string>
}

export async function inject(options: InjectOptions): Promise<{
  statusCode: number
  payload: string
  headers: Headers
}> {
  const response = await handleRequest(
    new Request(new URL(options.url, 'http://localhost'), {
      method: options.method,
      headers: options.headers,
    }),
  )

  return {
    statusCode: response.status,
    payload: await response.text(),
    headers: response.headers,
  }
}
