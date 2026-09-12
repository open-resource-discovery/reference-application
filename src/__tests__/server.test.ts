import { describe, expect, beforeEach, afterEach, it } from '@jest/globals'
import { FastifyInstance, fastify } from 'fastify'
import { astronomyV1Api } from '../api/astronomy/v1/index.js'
import { crmV1Api } from '../api/crm/v1/index.js'
import { healthCheckV1Api } from '../api/health/v1/index.js'
import { healthCheckV2Api } from '../api/health/v2/index.js'
import { ordDocumentV1Api } from '../api/open-resource-discovery/v1/index.js'
import { errorHandler } from '../error/errorHandler.js'
import { sapEventCatalogDefinition } from '../event/odm-finance-costobject/v1/eventCatalogDefinition.js'

describe('Server', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = fastify({
      logger: false,
      routerOptions: {
        ignoreTrailingSlash: true,
      },
      exposeHeadRoutes: true,
    })

    app.setErrorHandler(errorHandler)

    // Register all APIs
    await Promise.all([
      app.register(healthCheckV1Api, { prefix: '/health/v1' }),
      app.register(healthCheckV2Api, { prefix: '/health/v2' }),
      app.register(astronomyV1Api, { prefix: '/astronomy/v1' }),
      app.register(crmV1Api, { prefix: '/crm/v1' }),
      app.register(sapEventCatalogDefinition, { prefix: '/sap-events/v1' }),
      app.register(ordDocumentV1Api, {}),
    ])
  })

  afterEach(async () => {
    await app.close()
  })

  describe('Health Check Endpoints', () => {
    it('should return 200 OK for health check v1', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/v1',
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toBe('OK')
    })

    it('should return 200 OK for health check v2', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/v2',
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({ status: 'OK' })
    })
  })

  describe('API Registration', () => {
    it('should register astronomy API routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/astronomy/v1/constellations',
      })

      expect(response.statusCode).toBe(200)
    })

    it('should require authentication for CRM API routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/customers',
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-route',
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
