import { FastifyRequest } from 'fastify'
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
export function validateUserAuthorization(username: string, password: string, req: FastifyRequest): void {
  if (apiUsersAndPasswords[username] && apiUsersAndPasswords[username].password === password) {
    const tenantId = apiUsersAndPasswords[username].tenantId
    // Add user info to the request that we've validated
    req.user = {
      userName: username,
      tenantId,
      tenantConfiguration: tenants[tenantId],
    }
    req.log.info(`User "${username}" of tenant "${tenantId}" authenticated successfully.`)
  } else {
    throw new UnauthorizedError(`Unknown username "${username}" and password combination`)
  }
}

export function getTenantIdsFromHeader(req: CustomRequest): {
  localTenantId: string | undefined
  sapGlobalTenantId: string | undefined
} {
  let localTenantId = _.isArray(req.headers['sap-local-tenant-id'])
    ? req.headers['sap-local-tenant-id'].join()
    : req.headers['sap-local-tenant-id']

  if (req.query['local-tenant-id'] && localTenants.includes(req.query['local-tenant-id'])) {
    localTenantId = req.query['local-tenant-id']
  }

  const sapGlobalTenantId = _.isArray(req.headers['sap-global-tenant-id'])
    ? req.headers['sap-global-tenant-id'].join()
    : req.headers['sap-global-tenant-id']

  if (req.query['global-tenant-id'] && req.query['global-tenant-id'] in globalTenantIdToLocalTenantIdMapping) {
    localTenantId = req.query['global-tenant-id']
  }

  return {
    localTenantId,
    sapGlobalTenantId,
  }
}
