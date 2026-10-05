import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import {
  getOpenApiDefinition as getAstronomyOpenApiDefinition,
  getConstellationById,
  getConstellations,
} from './api/astronomy/v1/index.ts'
import { getOpenApiDefinition as getCrmOpenApiDefinition, getCustomerById, getCustomers } from './api/crm/v1/index.ts'
import { getHealthCheckV1 } from './api/health/v1/index.ts'
import { getHealthCheckV2 } from './api/health/v2/index.ts'
import {
  getOrdConfiguration,
  getOrdDocumentForTenant,
  getSystemVersionOrdDocument,
} from './api/open-resource-discovery/v1/index.ts'
import { authenticateBasicAuth } from './api/shared/validateUserAuthorization.ts'
import { getHttpError } from './error/errorHandler.ts'
import { InputValidationError } from './error/InputValidationError.ts'
import { getSapEventCatalogDefinition } from './event/odm-finance-costobject/v1/eventCatalogDefinition.ts'

const staticRoot = resolve(process.cwd(), 'dist/ui')
const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export async function handleRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const pathname = normalizePath(url.pathname)

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return notFound(request.method, pathname)
    }

    const response = await handleGet(request, pathname)
    return request.method === 'HEAD' ? withoutBody(response) : response
  } catch (error) {
    const httpError = getHttpError(error)
    const headers = new Headers()
    if (httpError.getHttpStatusCode() === 401) {
      headers.set('www-authenticate', 'Basic realm="ORD Reference Application"')
    }
    return jsonResponse(httpError.getErrorResponse(), httpError.getHttpStatusCode(), headers)
  }
}

async function handleGet(request: Request, pathname: string): Promise<Response> {
  switch (pathname) {
    case '/health/v1':
      return textResponse(getHealthCheckV1())
    case '/health/v2':
      return jsonResponse(getHealthCheckV2())
    case '/astronomy/v1/constellations':
      return jsonResponse(getConstellations())
    case '/astronomy/v1/openapi/oas3.json':
      return jsonResponse(getAstronomyOpenApiDefinition())
    case '/crm/v1/openapi/oas3.json':
      return jsonResponse(getCrmOpenApiDefinition(request))
    case '/crm/v1/customers':
      return jsonResponse(getCustomers(authenticateBasicAuth(request)))
    case '/sap-events/v1/odm-finance-costobject.asyncapi2.json':
      return jsonResponse(getSapEventCatalogDefinition(request))
    case '/.well-known/open-resource-discovery':
      return jsonResponse(getOrdConfiguration(), 200, undefined, request)
    case '/open-resource-discovery/v1/documents/system-version':
      return jsonResponse(getSystemVersionOrdDocument(), 200, undefined, request)
    case '/open-resource-discovery/v1/documents/system-instance': {
      const user = authenticateBasicAuth(request)
      return jsonResponse(getOrdDocumentForTenant(user.tenantId), 200, undefined, request)
    }
  }

  const constellationMatch = pathname.match(/^\/astronomy\/v1\/constellations\/([^/]+)$/)
  if (constellationMatch) {
    return jsonResponse(getConstellationById(decodeURIComponent(constellationMatch[1])))
  }

  const customerMatch = pathname.match(/^\/crm\/v1\/customers\/([^/]+)$/)
  if (customerMatch) {
    const idText = decodeURIComponent(customerMatch[1])
    if (!/^\d+$/.test(idText)) {
      throw new InputValidationError('Customer ID must be an integer', 'id')
    }
    return jsonResponse(getCustomerById(authenticateBasicAuth(request), Number(idText)))
  }

  return serveStaticFile(pathname, request.method)
}

async function serveStaticFile(pathname: string, method: string): Promise<Response> {
  const relativePath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1))
  const filePath = resolve(staticRoot, relativePath)
  if (filePath !== staticRoot && !filePath.startsWith(`${staticRoot}${sep}`)) {
    return notFound(method, pathname)
  }

  try {
    const body = await readFile(filePath)
    return new Response(body, {
      headers: {
        'content-length': body.byteLength.toString(),
        'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
      },
    })
  } catch (error) {
    if (isMissingFileError(error)) {
      return notFound(method, pathname)
    }
    throw error
  }
}

function jsonResponse(value: unknown, status = 200, additionalHeaders?: Headers, etagRequest?: Request): Response {
  const body = JSON.stringify(value)
  const headers = new Headers(additionalHeaders)
  headers.set('content-type', 'application/json; charset=utf-8')

  if (etagRequest) {
    const etag = `"${createHash('sha256').update(body).digest('base64url')}"`
    headers.set('etag', etag)
    if (etagRequest.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers })
    }
  }

  headers.set('content-length', Buffer.byteLength(body).toString())
  return new Response(body, { status, headers })
}

function textResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'content-length': Buffer.byteLength(body).toString(),
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}

function notFound(method: string, pathname: string): Response {
  return jsonResponse(
    {
      message: `Route ${method}:${pathname} not found`,
      error: 'Not Found',
      statusCode: 404,
    },
    404,
  )
}

function withoutBody(response: Response): Response {
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

function normalizePath(pathname: string): string {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return normalized || '/'
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}
