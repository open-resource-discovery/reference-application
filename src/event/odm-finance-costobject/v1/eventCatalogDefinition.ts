import { FastifyInstance } from 'fastify'
import { getTenantIdsFromHeader } from '../../../api/shared/validateUserAuthorization.js'
import { globalTenantIdToLocalTenantIdMapping } from '../../../data/user/tenantMapping.js'
import { SapEventCatalog } from '../../shared/SapEventCatalog.js'
import { getOdmCostObjectSapEventCatalogDefinition } from './config.js'
import { CustomRequest } from '../../../types/types.js'

export const openApiResourceName = 'openapi'

/**
 * As part of the ODM CostObject event resource we also return an SAP Event Catalog (AsyncAPI 2) definition
 * as a self description of the published events
 *
 * This will later be referenced through ORD.
 */
export async function sapEventCatalogDefinition(fastify: FastifyInstance): Promise<void> {
  fastify.get('/odm-finance-costobject.asyncapi2.json', {}, getSapEventCatalogDefinitionHandler)
}

async function getSapEventCatalogDefinitionHandler(req: CustomRequest): Promise<SapEventCatalog> {
  const tenantIds = getTenantIdsFromHeader(req)
  if (tenantIds.localTenantId) {
    // This is the `sap.foo.bar:open-local-tenant-id:v1` access strategy
    return getOdmCostObjectSapEventCatalogDefinition(tenantIds.localTenantId)
  } else if (tenantIds.globalTenantId) {
    // This is the `sap.foo.bar:open-global-tenant-id:v1` access strategy
    return getOdmCostObjectSapEventCatalogDefinition(globalTenantIdToLocalTenantIdMapping[tenantIds.globalTenantId])
  } else {
    // Return the definition without tenant specific modifications
    // This is the `open` access strategy
    return getOdmCostObjectSapEventCatalogDefinition()
  }
}
