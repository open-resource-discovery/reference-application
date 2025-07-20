import { FastifyRequest, FastifyReply } from 'fastify'
import _ from 'lodash'
import { TenantConfiguration, tenants } from '../../data/user/tenants.js'
import { apiUsersAndPasswords } from '../../data/user/users.js'
import { UnauthorizedError } from '../../error/UnauthorizedError.js'
import { globalTenantIdToLocalTenantIdMapping } from '../../data/user/tenantMapping.js'
import { CustomRequest } from '../../types/types.js'

export interface UserInfo {
  userName: string
  tenantId: string
  tenantConfiguration: TenantConfiguration
}

export const basicAuthConfig = { validate: validateUserAuthorization, authenticate: true }

const localTenants = Object.values(globalTenantIdToLocalTenantIdMapping)

/**
 * Validates a request for a valid BasicAuth login
 *
 * When successful it will annotate the request object with a user object
 * containing the user context information
 *
 * @throws UnauthorizedError
 */
export async function validateUserAuthorization(
  username: string,
  password: string,
  req: FastifyRequest,
  _reply: FastifyReply,
  done: (error?: Error) => void,
): Promise<void> {
  try {
    if (apiUsersAndPasswords[username] && apiUsersAndPasswords[username].password === password) {
      const tenantId = apiUsersAndPasswords[username].tenantId
      // Add user info to the request that we've validated
      req.user = {
        userName: username,
        tenantId,
        tenantConfiguration: tenants[tenantId],
      }
      req.log.info(`User "${username}" of tenant "${tenantId}" authenticated successfully.`)
      done()
    } else {
      done(new UnauthorizedError(`Unknown username "${username}" and password combination`))
    }
  } catch (error) {
    done(error instanceof Error ? error : new Error('Authentication failed'))
  }
}

export function getTenantIdsFromHeader(req: CustomRequest): {
  localTenantId: string | undefined
  globalTenantId: string | undefined
} {
  let localTenantId
  let globalTenantId

  // GET parameter has priority over header
  if (req.query['local-tenant-id']) {
    localTenantId = req.query['local-tenant-id']
  } else {
    localTenantId = _.isArray(req.headers['local-tenant-id'])
      ? req.headers['local-tenant-id'].join()
      : req.headers['local-tenant-id']
  }

  if (req.query['global-tenant-id']) {
    globalTenantId = req.query['global-tenant-id']
  } else {
    globalTenantId = _.isArray(req.headers['global-tenant-id'])
      ? req.headers['global-tenant-id'].join()
      : req.headers['global-tenant-id']
  }

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
