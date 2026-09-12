import type { OrdConfiguration } from '@open-resource-discovery/specification'
import { basicAuthAccessStrategy, openAccessStrategy } from './shared.ts'

export const ordConfiguration: OrdConfiguration = {
  openResourceDiscoveryV1: {
    documents: [
      // Serve static metadata with open access strategy, ignore tenant headers
      {
        url: '/open-resource-discovery/v1/documents/system-version',
        accessStrategies: [openAccessStrategy],
        perspective: 'system-version',
      },
      // Serve dynamic metadata for the tenant identified by Basic Auth
      {
        url: '/open-resource-discovery/v1/documents/system-instance',
        accessStrategies: [basicAuthAccessStrategy],
        perspective: 'system-instance',
      },
    ],
  },
}
