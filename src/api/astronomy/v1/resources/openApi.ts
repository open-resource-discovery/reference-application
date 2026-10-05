import type { OpenAPIV3 } from 'openapi-types'
import { getAstronomyV1ApiDefinition } from '../config.ts'

export const openApiResourceName = 'openapi'

/**
 * As part of the Astronomy V1 API we also return the OpenAPI 3 definition
 * as a self description of the service and to expose the API contract
 *
 * This will later be referenced through ORD.
 */
export function getOpenApiDefinition(): OpenAPIV3.Document {
  return getAstronomyV1ApiDefinition()
}
