import { FastifyInstance, FastifyRequest } from 'fastify'
import { healthCheckV2Config } from './config.js'

/**
 * This is a typical health check API for health probes
 * as used by CloudFoundry or K8s
 */
export function healthCheckV2Api(fastify: FastifyInstance): void {
  fastify.log.info(`Registering ${healthCheckV2Config.apiName}...`)
  fastify.get('/', (req: FastifyRequest) => {
    req.log.debug('Health Check invoked')
    return {
      status: 'OK',
    }
  })
}
