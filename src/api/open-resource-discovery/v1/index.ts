import { ordConfiguration } from './data/configuration.ts'
import { getOrdDocumentForTenant, ordDocument } from './data/document.ts'

export function getOrdConfiguration(): typeof ordConfiguration {
  return ordConfiguration
}

export function getSystemVersionOrdDocument(): typeof ordDocument {
  return ordDocument
}

export { getOrdDocumentForTenant }
