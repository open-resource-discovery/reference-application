import * as path from 'node:path'
import { fastifyStatic } from '@fastify/static'
import { fastify } from 'fastify'
import { crmV1ApiConfig } from './api/crm/v1/config.ts'
import { crmV1Api } from './api/crm/v1/index.ts'
import { healthCheckV1Config } from './api/health/v1/config.ts'
import { healthCheckV1Api } from './api/health/v1/index.ts'
import { healthCheckV2Config } from './api/health/v2/config.ts'
import { healthCheckV2Api } from './api/health/v2/index.ts'
import { ordDocumentV1Api } from './api/open-resource-discovery/v1/index.ts'
import { PORT } from './config.ts'
import { errorHandler } from './error/errorHandler.ts'
import { logger } from './shared/logger.ts'

const server = fastify({
  logger,
  routerOptions: {
    ignoreTrailingSlash: true,
  },
  exposeHeadRoutes: true,
})

initServer().catch(console.error)

async function initServer(): Promise<void> {
  // Setup generic error handling
  server.setErrorHandler(errorHandler)

  // Register the APIs of the backend
  await Promise.all([
    server.register(healthCheckV1Api, { prefix: `/${healthCheckV1Config.apiEntryPoint}` }),
    server.register(healthCheckV2Api, { prefix: `/${healthCheckV2Config.apiEntryPoint}` }),
    server.register(crmV1Api, { prefix: `/${crmV1ApiConfig.apiEntryPoint}` }),
    server.register(ordDocumentV1Api, {}),
  ])

  // Static file serving, to serve some HTML documentation for the reference app
  await server.register(fastifyStatic, {
    prefix: '/',
    root: path.resolve(process.cwd(), './static'),
  })

  await server.listen({
    port: PORT,
    host: '0.0.0.0',
  })

  server.log.info(`Server listening at http://localhost:${PORT}`)
}

function closeGracefully(signal: string): void {
  console.log(`Received signal to terminate: ${signal}`)
  process.exit()
}
process.on('SIGINT', closeGracefully)
process.on('SIGTERM', closeGracefully)
