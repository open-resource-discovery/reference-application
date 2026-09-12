import type { FastifyInstance } from 'fastify'
import { astronomyV1ApiConfig } from './config.ts'
import { constellationsResource, constellationsResourceName } from './resources/constellations.ts'
import { openApiResource, openApiResourceName } from './resources/openApi.ts'

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
