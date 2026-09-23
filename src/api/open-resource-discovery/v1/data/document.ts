import type { ApiResource, OrdDocument } from '@open-resource-discovery/specification'
import { tenants } from '../../../../data/user/tenants.ts'
import { crmV1ApiConfig } from '../../../crm/v1/config.ts'
import {
  appNamespace,
  basicAuthConsumptionBundle,
  customAccessStrategyGlobalTenantId,
  customAccessStrategyLocalTenantId,
  describedSystemInstance,
  describedSystemVersion,
  noAuthConsumptionBundle,
  openAccessStrategy,
  ordReferenceAppApiPackage,
  product,
} from './shared.ts'

const crmV1ApiResource: ApiResource = {
  ordId: `${appNamespace}:apiResource:${crmV1ApiConfig.apiNamespace}:${crmV1ApiConfig.apiMajorVersion}`,
  title: crmV1ApiConfig.apiName,
  shortDescription: 'The CRM API allows you to manage customers...',
  description: 'This API is **protected** via BasicAuth and is tenant aware',
  version: crmV1ApiConfig.apiVersion,
  lastUpdate: new Date().toISOString(),
  visibility: 'internal',
  releaseStatus: 'beta',
  partOfPackage: ordReferenceAppApiPackage.ordId,
  partOfConsumptionBundles: [
    {
      ordId: basicAuthConsumptionBundle.ordId,
    },
  ],
  apiProtocol: 'rest',
  apiResourceLinks: [
    {
      type: 'api-documentation',
      url: '/swagger-ui.html?urls.primaryName=CRM%20V1%20API',
    },
  ],
  resourceDefinitions: [
    {
      type: 'openapi-v3',
      mediaType: 'application/json',
      url: '/iss/v1/openapi/oas3.json',
      accessStrategies: [customAccessStrategyGlobalTenantId, customAccessStrategyLocalTenantId, openAccessStrategy],
    },
  ],
  entryPoints: [`/${crmV1ApiConfig.apiEntryPoint}`],
  extensible: {
    supported: 'manual',
    description: 'This API can be extended with custom fields.',
  },
  changelogEntries: [
    {
      version: '0.3.0',
      date: '2021-05-25',
      releaseStatus: 'beta',
    },
  ],
}


/**
 * This is the complete ORD document that will be served through the ORD Document API
 */
export const ordDocument: OrdDocument = {
  openResourceDiscovery: '1.12',
  policyLevels: ['sap:core:v1'],
  perspective: 'system-version',
  describedSystemVersion: describedSystemVersion,
  description: 'This is an example ORD document which describes the entire reference app in one document.',
  describedSystemInstance: describedSystemInstance,
  products: [product],
  packages: [ordReferenceAppApiPackage],
  apiResources: [crmV1ApiResource],
  eventResources: [],
  consumptionBundles: [noAuthConsumptionBundle],
  entityTypes: [],
  tombstones: [],
}

/**
 * As we want to demonstrate a tenant specific ORD Document,
 * We'll return a different one per tenant, respecting some tenant configurations
 */
export function getOrdDocumentForTenant(tenantId?: string): OrdDocument {
  const tenantSpecificOrdDocument = structuredClone(ordDocument)

  tenantSpecificOrdDocument.perspective = 'system-instance'

  // If we don't provide a local tenant Id, we'll return the ORD document without tenant specific modifications
  // An alternative to this could be to throw an invalid user input error and require to provide a tenant
  if (!tenantId) {
    return tenantSpecificOrdDocument
  }

  // Add describedSystemInstance with the local tenant ID
  tenantSpecificOrdDocument.describedSystemInstance = {
    localId: tenantId,
  }

  tenantSpecificOrdDocument.description += `\nThis ORD Document is specific to tenant "${tenantId}"`

  const tenantConfig = tenants[tenantId]
  if (!tenantConfig.enabledApis.includes('crm')) {
    // Do not describe the CRM V1 API if the tenant does not have it available
    tenantSpecificOrdDocument.apiResources = tenantSpecificOrdDocument.apiResources?.filter(
      (apiResource) => apiResource.ordId !== crmV1ApiResource.ordId,
    )
  }

  return tenantSpecificOrdDocument
}
