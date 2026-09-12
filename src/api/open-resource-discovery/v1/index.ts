import { fastifyBasicAuth } from '@fastify/basic-auth'
import fastifyETag from '@fastify/etag'
import type { FastifyInstance } from 'fastify'
import { UnauthorizedError } from '../../../error/UnauthorizedError.js'
import { basicAuthConfig } from '../../shared/validateUserAuthorization.js'
import { ordDocumentApiV1Config } from './config.js'
import { ordConfiguration } from './data/configuration.js'
import { getOrdDocumentForTenant, ordDocument } from './data/document.js'

export async function ordDocumentV1Api(fastify: FastifyInstance): Promise<void> {
  fastify.log.info(`Registering ${ordDocumentApiV1Config.apiName}...`)

  // Add support for ETag as RECOMMENDED by ORD and according to RFC2616-sec13
  // @see https://github.com/fastify/fastify-etag
  await fastify.register(fastifyETag)
  await fastify.register(fastifyBasicAuth, basicAuthConfig)

  // SYSTEM INSTANCE UNAWARE ORD information

  // Serve the .well-known ORD configuration
  fastify.get('/.well-known/open-resource-discovery', () => {
    return ordConfiguration
  })

  // Serve the unprotected, static "system-version" ORD document
  fastify.get(`/${ordDocumentApiV1Config.apiEntryPoint}/documents/system-version`, () => {
    return ordDocument
  })

  // DYNAMIC (system instance perspective) ORD information

  // Serve the protected, system instance aware ORD document.
  // The authenticated user determines the tenant whose metadata is returned.
  fastify.get(
    `/${ordDocumentApiV1Config.apiEntryPoint}/documents/system-instance`,
    { onRequest: fastify.basicAuth },
    (req) => {
      if (!req.user?.tenantId) {
        throw new UnauthorizedError('The authenticated user has no tenant assigned')
      }

      return getOrdDocumentForTenant(req.user.tenantId)
    },
  )
}
