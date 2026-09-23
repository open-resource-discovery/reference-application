import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { type FastifyInstance, fastify } from 'fastify'
import { crmV1Api } from '../api/crm/v1/index.ts'
import { healthCheckV1Api } from '../api/health/v1/index.ts'
import { healthCheckV2Api } from '../api/health/v2/index.ts'
import { ordDocumentV1Api } from '../api/open-resource-discovery/v1/index.ts'
import { errorHandler } from '../error/errorHandler.ts'

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
      app.register(crmV1Api, { prefix: '/crm/v1' }),
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

      assert.equal(response.statusCode, 200)
      assert.equal(response.payload, 'OK')
    })

    it('should return 200 OK for health check v2', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/v2',
      })

      assert.equal(response.statusCode, 200)
      assert.deepEqual(JSON.parse(response.payload), { status: 'OK' })
    })
  })

  describe('API Registration', () => {
    it('should require authentication for CRM API routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/customers',
      })

      assert.equal(response.statusCode, 401)
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-route',
      })

      assert.equal(response.statusCode, 404)
    })
  })
})
