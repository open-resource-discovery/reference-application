import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import { FastifyInstance, fastify } from 'fastify'
import { astronomyV1Api } from '../../src/api/astronomy/v1/index.js'
import { crmV1Api } from '../../src/api/crm/v1/index.js'
import { healthCheckV1Api } from '../../src/api/health/v1/index.js'
import { healthCheckV2Api } from '../../src/api/health/v2/index.js'
import { ordDocumentV1Api } from '../../src/api/open-resource-discovery/v1/index.js'
import { errorHandler } from '../../src/error/errorHandler.js'
import { sapEventCatalogDefinition } from '../../src/event/odm-finance-costobject/v1/eventCatalogDefinition.js'
import { Constellation } from '../api/astronomy/v1/models/Constellation.js'
import { ORDDocument } from '@open-resource-discovery/specification'
import { SapEventCatalog } from '../event/shared/SapEventCatalog.js'
import { ErrorItem } from '../shared/model/ErrorResponses.js'

describe('Server Integration Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = fastify({
      logger: false,
    })

    app.setErrorHandler(errorHandler)

    try {
      await app.register(healthCheckV1Api, { prefix: '/health/v1' })
      await app.register(healthCheckV2Api, { prefix: '/health/v2' })
      await app.register(astronomyV1Api, { prefix: '/astronomy/v1' })
      await app.register(crmV1Api, { prefix: '/crm/v1' })
      await app.register(sapEventCatalogDefinition, { prefix: '/sap-events/v1' })
      await app.register(ordDocumentV1Api, {})
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error during plugin registration:', err)
      throw err
    }
  })

  afterAll(async () => {
    try {
      await app.close()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error closing the server:', err)
    }
  })

  describe('Astronomy API Integration', () => {
    it('should retrieve constellations list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/astronomy/v1/constellations',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload) as { value: Constellation[] }
      expect(body).toHaveProperty('value')
      expect(Array.isArray(body.value)).toBe(true)
      expect(body.value.length).toBeGreaterThan(0)
      expect(body.value[0]).toHaveProperty('id')
      expect(body.value[0]).toHaveProperty('name')
    })

    it('should retrieve a specific constellation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/astronomy/v1/constellations/And',
      })

      expect(response.statusCode).toBe(200)
      const constellation = JSON.parse(response.payload) as { value: Constellation[] }
      expect(constellation).toEqual({
        id: 'And',
        name: 'Andromeda',
      })
    })
  })

  describe('CRM API Integration', () => {
    const validCredentials = Buffer.from('foo:bar').toString('base64')
    const invalidCredentials = Buffer.from('invalid:credentials').toString('base64')

    it('should require authentication for customers endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/customers',
      })

      expect(response.statusCode).toBe(401)
    })

    it('should reject invalid credentials', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/customers',
        headers: {
          Authorization: `Basic ${invalidCredentials}`,
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should return customers list with valid credentials', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/customers',
        headers: {
          Authorization: `Basic ${validCredentials}`,
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload) as { value: { id: string; name: string }[] }
      expect(body).toHaveProperty('value')
      expect(Array.isArray(body.value)).toBe(true)
    })
  })

  describe('Health Check API Integration', () => {
    it('should return OK for v1 health check', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/v1',
      })

      expect(response.statusCode).toBe(200)
      expect(response.payload).toBe('OK')
    })

    it('should return status object for v2 health check', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/v2',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload) as { value: { id: string; name: string }[] }
      expect(body).toEqual({ status: 'OK' })
    })
  })

  describe('ORD Document API Integration', () => {
    it('should return ORD configuration', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/open-resource-discovery',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload) as { value: { id: string; name: string }[] }
      expect(body).toHaveProperty('openResourceDiscoveryV1')
    })

    it('should return static system-instance perspective ORD document', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/open-resource-discovery/v1/documents/system-version',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload) as Partial<ORDDocument>
      expect(body).toHaveProperty('openResourceDiscovery')
    })

    it('should return tenant-aware, system-instance ORD document', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/open-resource-discovery/v1/documents/system-instance',
        headers: {
          'local-tenant-id': 'T1',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload) as { description: string }
      expect(body).toHaveProperty('openResourceDiscovery')
      expect(body.description).toContain('T1')
    })
  })

  describe('Event Catalog Integration', () => {
    it('should return event catalog definition', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/sap-events/v1/odm-finance-costobject.asyncapi2.json',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload) as SapEventCatalog
      expect(body).toHaveProperty('asyncapi')
      expect(body).toHaveProperty('channels')
    })

    it('should return tenant-specific event catalog', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/sap-events/v1/odm-finance-costobject.asyncapi2.json',
        headers: {
          'local-tenant-id': 'T1',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload) as SapEventCatalog
      expect(body).toHaveProperty('asyncapi')
      expect(body).toHaveProperty('channels')
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle invalid URLs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/invalid-url',
      })

      expect(response.statusCode).toBe(404)
      const error = JSON.parse(response.payload) as ErrorItem
      expect(error).toHaveProperty('message')
      expect(error).toHaveProperty('statusCode')
    })

    it('should handle invalid methods', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/health/v1',
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
