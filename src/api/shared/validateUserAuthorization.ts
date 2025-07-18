import { FastifyRequest, FastifyQueryParameters } from 'fastify'
import _ from 'lodash'
import { TenantConfiguration, tenants } from '../../data/user/tenants.js'
import { apiUsersAndPasswords } from '../../data/user/users.js'
import { UnauthorizedError } from '../../error/UnauthorizedError.js'

export interface UserInfo {
  userName: string
  tenantId: string
  tenantConfiguration: TenantConfiguration
}

export const basicAuthConfig = { validate: validateUserAuthorization, authenticate: true }

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
): Promise<void> {
  if (apiUsersAndPasswords[username] && apiUsersAndPasswords[username].password === password) {
    const tenantId = apiUsersAndPasswords[username].tenantId
    // Add user info to the request that we've validated
    req.user = {
      userName: username,
      tenantId,
      tenantConfiguration: tenants[tenantId],
    }
    req.log.info(`User "${username}" of tenant "${tenantId}" authenticated successfully.`)
    return
  } else {
    throw new UnauthorizedError(`Unknown username "${username}" and password combination`)
  }
}

export function getTenantIdsFromHeader(
  headers: FastifyRequest['headers'],
  queryTenantId?: string,
): {
  localTenantId: string | undefined
  sapGlobalTenantId: string | undefined
} {
  const localTenantId =
    queryTenantId === 'T1'
      ? queryTenantId
      : _.isArray(headers['sap-local-tenant-id'])
        ? headers['sap-local-tenant-id'].join()
        : headers['sap-local-tenant-id']
  const sapGlobalTenantId = _.isArray(headers['sap-global-tenant-id'])
    ? headers['sap-global-tenant-id'].join()
    : headers['sap-global-tenant-id']

  return {
    localTenantId,
    sapGlobalTenantId,
  }
}
