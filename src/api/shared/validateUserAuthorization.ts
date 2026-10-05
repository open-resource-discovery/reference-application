import { globalTenantIdToLocalTenantIdMapping } from '../../data/user/tenantMapping.ts'
import { apiUsersAndPasswords } from '../../data/user/users.ts'
import { UnauthorizedError } from '../../error/UnauthorizedError.ts'

export interface UserInfo {
  userName: string
  tenantId: string
}

const localTenants = Object.values(globalTenantIdToLocalTenantIdMapping)

/**
 * Validates a request for a valid BasicAuth login
 *
 * Returns the authenticated user and tenant context.
 *
 * @throws UnauthorizedError
 */
export function authenticateBasicAuth(request: Request): UserInfo {
  const authorization = request.headers.get('authorization')
  const match = authorization?.match(/^Basic\s+(.+)$/i)
  if (!match) {
    throw new UnauthorizedError('Missing or invalid Basic Authorization header')
  }

  const credentials = Buffer.from(match[1], 'base64').toString('utf8')
  const separator = credentials.indexOf(':')
  const username = separator >= 0 ? credentials.slice(0, separator) : credentials
  const password = separator >= 0 ? credentials.slice(separator + 1) : ''
  const user = apiUsersAndPasswords[username]

  if (!user || user.password !== password) {
    throw new UnauthorizedError(`Unknown username "${username}" and password combination`)
  }

  return {
    userName: username,
    tenantId: user.tenantId,
  }
}

export function getTenantIdsFromRequest(request: Request): {
  localTenantId: string | undefined
  globalTenantId: string | undefined
} {
  let localTenantId: string | undefined
  let globalTenantId: string | undefined

  const url = new URL(request.url)
  // GET parameter has priority over header
  localTenantId = url.searchParams.get('local-tenant-id') ?? request.headers.get('local-tenant-id') ?? undefined
  globalTenantId = url.searchParams.get('global-tenant-id') ?? request.headers.get('global-tenant-id') ?? undefined

  // Validation
  if (localTenantId && !localTenants.includes(localTenantId)) {
    throw new UnauthorizedError(`Unknown local tenant ID '${localTenantId}'`)
  }

  if (globalTenantId && !globalTenantIdToLocalTenantIdMapping[globalTenantId]) {
    throw new UnauthorizedError(`Unknown global tenant ID '${globalTenantId}'`)
  }

  return {
    localTenantId,
    globalTenantId,
  }
}
