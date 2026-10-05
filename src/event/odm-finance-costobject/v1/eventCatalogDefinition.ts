import { getTenantIdsFromRequest } from '../../../api/shared/validateUserAuthorization.ts'
import { globalTenantIdToLocalTenantIdMapping } from '../../../data/user/tenantMapping.ts'
import type { SapEventCatalog } from '../../shared/SapEventCatalog.ts'
import { getOdmCostObjectSapEventCatalogDefinition } from './config.ts'

export const openApiResourceName = 'openapi'

/**
 * As part of the ODM CostObject event resource we also return an SAP Event Catalog (AsyncAPI 2) definition
 * as a self description of the published events
 *
 * This will later be referenced through ORD.
 */
export function getSapEventCatalogDefinition(request: Request): SapEventCatalog {
  const tenantIds = getTenantIdsFromRequest(request)
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
