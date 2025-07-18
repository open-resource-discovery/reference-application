import { FastifyInstance } from 'fastify'
import { OpenAPIV3 } from 'openapi-types'
import { globalTenantIdToLocalTenantIdMapping } from '../../../../data/user/tenantMapping.js'
import { getTenantIdsFromHeader } from '../../../shared/validateUserAuthorization.js'
import { getCrmV1ApiDefinition } from '../config.js'
import { CustomRequest } from '../../../../types/types.js'

export const openApiResourceName = 'openapi'

/**
 * As part of the Astronomy V1 API we also return the OpenAPI 3 definition
 * as a self description of the service and to expose the API contract
 *
 * This will later be referenced through ORD.
 */
export async function openApiResource(fastify: FastifyInstance): Promise<void> {
  fastify.get('/oas3.json', {}, getOpenApiDefinitionHandler)
}

async function getOpenApiDefinitionHandler(req: CustomRequest): Promise<OpenAPIV3.Document> {
  const tenantIds = getTenantIdsFromHeader(req)
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
