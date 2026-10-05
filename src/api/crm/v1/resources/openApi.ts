import type { OpenAPIV3 } from 'openapi-types'
import { globalTenantIdToLocalTenantIdMapping } from '../../../../data/user/tenantMapping.ts'
import { getTenantIdsFromRequest } from '../../../shared/validateUserAuthorization.ts'
import { getCrmV1ApiDefinition } from '../config.ts'

export const openApiResourceName = 'openapi'

/**
 * As part of the Astronomy V1 API we also return the OpenAPI 3 definition
 * as a self description of the service and to expose the API contract
 *
 * This will later be referenced through ORD.
 */
export function getOpenApiDefinition(request: Request): OpenAPIV3.Document {
  const tenantIds = getTenantIdsFromRequest(request)
  if (tenantIds.localTenantId) {
    // This is the `sap.foo.bar:open-local-tenant-id:v1` access strategy
    return getCrmV1ApiDefinition(tenantIds.localTenantId)
  } else if (tenantIds.globalTenantId) {
    // This is the `sap.foo.bar:open-global-tenant-id:v1` access strategy
    return getCrmV1ApiDefinition(globalTenantIdToLocalTenantIdMapping[tenantIds.globalTenantId])
  } else {
    // Return the OpenAPI definition without tenant specific modifications
    // This is the `open` access strategy
    return getCrmV1ApiDefinition()
  }
}
