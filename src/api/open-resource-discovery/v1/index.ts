import { FastifyInstance } from 'fastify'
import fastifyETag from '@fastify/etag'
import { globalTenantIdToLocalTenantIdMapping } from '../../../data/user/tenantMapping.js'
import { getTenantIdsFromHeader } from '../../shared/validateUserAuthorization.js'
import { ordDocumentApiV1Config } from './config.js'
import { ordConfiguration } from './data/configuration.js'
import { getOrdDocumentForTenant, ordDocument } from './data/document.js'
import { CustomRequest } from '../../../types/types.js'

export async function ordDocumentV1Api(fastify: FastifyInstance): Promise<void> {
  fastify.log.info(`Registering ${ordDocumentApiV1Config.apiName}...`)

  // Add support for ETag as RECOMMENDED by ORD and according to RFC2616-sec13
  // @see https://github.com/fastify/fastify-etag
  await fastify.register(fastifyETag)

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

  // Serve the unprotected, but system instance aware ORD Document #2
  // The result of this request will differ, depending on the tenant chosen
  // We'll implement this as an ORD access strategy, where the tenant ID is passed via Header
  // To show multiple options, we can offer both local tenant ID and global tenant ID for correlations
  fastify.get(`/${ordDocumentApiV1Config.apiEntryPoint}/documents/system-instance`, (req: CustomRequest) => {
    const tenantIds = getTenantIdsFromHeader(req)

    if (tenantIds.localTenantId) {
      // This is the `sap.foo.bar:open-local-tenant-id:v1` access strategy
      return getOrdDocumentForTenant(tenantIds.localTenantId)
    } else if (tenantIds.sapGlobalTenantId) {
      // This is the `sap.foo.bar:open-global-tenant-id:v1` access strategy
      return getOrdDocumentForTenant(globalTenantIdToLocalTenantIdMapping[tenantIds.sapGlobalTenantId])
    } else {
      throw new Error(
        'No tenant ID provided in the request header via local-tenant-id or global-tenant-id. Hint: for demo purposes it can be set in the query string as well, e.g. ?local-tenant-id=T1',
      )
    }
  })
}
