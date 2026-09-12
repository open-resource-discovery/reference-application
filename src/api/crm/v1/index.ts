import type { FastifyInstance } from 'fastify'
import { crmV1ApiConfig } from './config.js'
import { customersResource, customersResourceName } from './resources/customer.js'
import { openApiResource, openApiResourceName } from './resources/openApi.js'

/**
 * Customer V1 API
 *
 * Registers all REST resources individually
 */
export async function crmV1Api(fastify: FastifyInstance): Promise<void> {
  fastify.log.info(`Registering ${crmV1ApiConfig.apiName}...`)

  await fastify.register(openApiResource, { prefix: openApiResourceName })
  await fastify.register(customersResource, { prefix: customersResourceName })
}
