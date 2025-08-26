import { FastifyInstance } from 'fastify'
import { OpenAPIV3 } from 'openapi-types'
import { getAstronomyV1ApiDefinition } from '../config.js'

export const openApiResourceName = 'openapi'

/**
 * As part of the Astronomy V1 API we also return the OpenAPI 3 definition
 * as a self description of the service and to expose the API contract
 *
 * This will later be referenced through ORD.
 */
export function openApiResource(fastify: FastifyInstance): void {
  fastify.get('/oas3.json', {}, getOpenApiDefinitionHandler)
}

function getOpenApiDefinitionHandler(): OpenAPIV3.Document {
  return getAstronomyV1ApiDefinition()
}
