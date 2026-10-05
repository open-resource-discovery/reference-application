import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { inject } from './testClient.ts'

describe('Server', () => {
  const app = { inject }

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
    it('should register astronomy API routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/astronomy/v1/constellations',
      })

      assert.equal(response.statusCode, 200)
    })

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
