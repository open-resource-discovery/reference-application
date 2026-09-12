import type { FastifyInstance } from 'fastify'
import { astronomyV1ApiConfig } from './config.js'
import { constellationsResource, constellationsResourceName } from './resources/constellations.js'
import { openApiResource, openApiResourceName } from './resources/openApi.js'

/**
 * Astronomy V1 API
 *
 * Registers all REST resources individually
 */
export async function astronomyV1Api(fastify: FastifyInstance): Promise<void> {
  fastify.log.info(`Registering ${astronomyV1ApiConfig.apiName}...`)
  await fastify.register(constellationsResource, { prefix: constellationsResourceName })
  await fastify.register(openApiResource, { prefix: openApiResourceName })
}
