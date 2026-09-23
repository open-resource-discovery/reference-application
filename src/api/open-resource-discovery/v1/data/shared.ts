import { readFileSync } from 'node:fs'
import path from 'node:path'
import type {
  ConsumptionBundle,
  MetadataDefinitionAccessStrategy,
  OrdV1DocumentAccessStrategy,
  Package,
  Product,
  SystemInstance,
  SystemVersion,
} from '@open-resource-discovery/specification'
import { PUBLIC_URL } from '../../../../config.ts'

const packageJson = JSON.parse(readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')) as {
  version: string
  description: string
}

// In this file we have ORD information that are shared between multiple ORD documents

/**
 * This is just a fake namespace for this application.
 * A real namespace needs to be registered first.
 * */
export const appNamespace = 'sap.xref'

// We assume that the Vendor "SAP" is already defined and just reference it via ORD ID
const vendorSapReference = 'sap:vendor:SAP:'

export const describedSystemInstance: SystemInstance = {
  baseUrl: PUBLIC_URL,
}
export const describedSystemVersion: SystemVersion = {
  version: packageJson.version,
}

export const product: Product = {
  ordId: `${appNamespace}:product:Intelligent_Selling_Services:`,
  title: 'ORD Reference App',
  vendor: vendorSapReference,
  shortDescription: 'Open Resource Discovery Reference Application',
}

export const ordReferenceAppApiPackage: Package = {
  ordId: `${appNamespace}:package:Intelligent_Selling_Services-apis:v1`,
  title: 'ORD Reference Application APIs',
  shortDescription: packageJson.description,
  description:
    'This reference application demonstrates how Open Resource Discovery (ORD) can be implemented, demonstrating different resources and discovery aspects',
  version: '1.0.0',
  policyLevels: ['sap:core:v1'],
  partOfProducts: [product.ordId],
  vendor: vendorSapReference,
  tags: ['reference application'],
  packageLinks: [
    {
      type: 'license',
      url: 'https://github.com/open-resource-discovery/reference-application/blob/main/LICENSE',
    },
  ],
  links: [
    {
      title: 'ORD Reference app description',
      url: 'https://github.com/open-resource-discovery/reference-application/blob/main/README.md',
    },
    {
      title: 'ORD Reference app GitHub repository',
      url: 'https://github.com/open-resource-discovery/reference-application/',
    },
  ],
  labels: {
    'example:customLabel': ['labels are more flexible than tags as you can define your own keys'],
  },
}

export const noAuthConsumptionBundle: ConsumptionBundle = {
  ordId: `${appNamespace}:consumptionBundle:noAuth:v1`,
  version: '1.0.0',
  lastUpdate: '2023-02-03T06:44:10Z',
  title: 'Unprotected resources',
  shortDescription: 'Bundle of unprotected resources',
  description:
    'This Consumption Bundle contains all resources of the reference app which are unprotected and do not require authentication',
}

export const basicAuthConsumptionBundle: ConsumptionBundle = {
  ordId: `${appNamespace}:consumptionBundle:basicAuth:v1`,
  title: 'BasicAuth protected resources',
  version: '1.0.0',
  lastUpdate: '2023-02-03T06:44:10Z',
  shortDescription: 'Bundle of protected resources',
  description:
    'This Consumption Bundle contains all resources of the reference app which share the same BasicAuth access and identity realm',
  credentialExchangeStrategies: [
    {
      type: 'custom',
      customType: `${appNamespace}:basicAuthCredentialExchange:v1`,
      customDescription:
        'The BasicAuth credentials must be created and retrieved manually.\n Please refer to the documentation on the [ORD Reference App API access](https://github.com/open-resource-discovery/reference-application#access-strategies).',
    },
  ],
}

/**
 * This is a custom access strategy that is specific to the ORD Reference application
 */
export const openAccessStrategy = {
  type: 'open',
} satisfies OrdV1DocumentAccessStrategy & MetadataDefinitionAccessStrategy

/**
 * Resources using this strategy derive their tenant context from the
 * authenticated user.
 */
export const basicAuthAccessStrategy = {
  type: 'basic-auth',
} satisfies OrdV1DocumentAccessStrategy & MetadataDefinitionAccessStrategy

/**
 * This is a custom access strategy that is specific to the ORD Reference application
 */
export const customAccessStrategyGlobalTenantId = {
  type: 'custom',
  customType: `${appNamespace}:open-global-tenant-id:v1`,
  customDescription:
    'The metadata information is openly accessible but system instance aware.\n' +
    'The tenant is selected by providing a SAP global tenant ID header.\n' +
    'To understand how to use this access strategy, please read the documentation on the ' +
    '[ORD Reference App Access Strategies](https://github.com/open-resource-discovery/reference-application#access-strategies).',
} satisfies OrdV1DocumentAccessStrategy & MetadataDefinitionAccessStrategy

/**
 * This is a custom access strategy that is specific to the ORD Reference application
 */
export const customAccessStrategyLocalTenantId = {
  type: 'custom',
  customType: `${appNamespace}:open-local-tenant-id:v1`,
  customDescription:
    'The metadata information is openly accessible but system instance aware.\n' +
    'The tenant is selected by providing a local tenant ID header.\n' +
    'To understand how to use this access strategy, please read the documentation on the ' +
    '[ORD Reference App Access Strategies](https://github.com/open-resource-discovery/reference-application#access-strategies).',
} satisfies OrdV1DocumentAccessStrategy & MetadataDefinitionAccessStrategy
