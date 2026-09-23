import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { OrdDocument } from '@open-resource-discovery/specification'
import { type FastifyInstance, fastify } from 'fastify'
import { crmV1Api } from '../../src/api/crm/v1/index.ts'
import { healthCheckV1Api } from '../../src/api/health/v1/index.ts'
import { healthCheckV2Api } from '../../src/api/health/v2/index.ts'
import { ordDocumentV1Api } from '../../src/api/open-resource-discovery/v1/index.ts'
import { errorHandler } from '../../src/error/errorHandler.ts'
import type { ErrorItem } from '../shared/model/ErrorResponses.ts'
import type { SapOpenApiDocument } from '../shared/model/OpenAPI.ts'

describe('Server Integration Tests', () => {
  let app: FastifyInstance

  before(async () => {
    app = fastify({
      logger: false,
    })

    app.setErrorHandler(errorHandler)

    await app.register(healthCheckV1Api, { prefix: '/health/v1' })
    await app.register(healthCheckV2Api, { prefix: '/health/v2' })
    await app.register(crmV1Api, { prefix: '/crm/v1' })
    await app.register(ordDocumentV1Api, {})
  })

  after(async () => {
    await app.close()
  })

  describe('CRM API Integration', () => {
    const validCredentials = Buffer.from('foo:bar').toString('base64')
    const invalidCredentials = Buffer.from('invalid:credentials').toString('base64')

    it('should require authentication for customers endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/customers',
      })

      assert.equal(response.statusCode, 401)
    })

    it('should reject invalid credentials', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/customers',
        headers: {
          Authorization: `Basic ${invalidCredentials}`,
        },
      })

      assert.equal(response.statusCode, 401)
    })

    it('should return customers list with valid credentials', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/customers',
        headers: {
          Authorization: `Basic ${validCredentials}`,
        },
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as { value: { id: string; name: string }[] }
      assert.ok('value' in body)
      assert.ok(Array.isArray(body.value))
    })

    it('should publish SAP-compliant OpenAPI metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/crm/v1/openapi/oas3.json',
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as SapOpenApiDocument
      assert.equal(body['x-sap-shortText'], 'Manage tenant-specific customer records.')
      assert.ok(body.externalDocs?.url)
      assert.ok(body.components?.securitySchemes?.basicAuth)
    })
  })

  describe('Health Check API Integration', () => {
    it('should return OK for v1 health check', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/v1',
      })

      assert.equal(response.statusCode, 200)
      assert.equal(response.payload, 'OK')
    })

    it('should return status object for v2 health check', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/v2',
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as { value: { id: string; name: string }[] }
      assert.deepEqual(body, { status: 'OK' })
    })
  })

  describe('ORD Document API Integration', () => {
    const tenantT1Credentials = Buffer.from('foo:bar').toString('base64')
    const tenantT2Credentials = Buffer.from('bar:foo').toString('base64')
    const invalidCredentials = Buffer.from('invalid:credentials').toString('base64')

    it('should return ORD configuration', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/.well-known/open-resource-discovery',
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as {
        openResourceDiscoveryV1: { documents: { perspective?: string; accessStrategies: { type: string }[] }[] }
      }
      assert.ok('openResourceDiscoveryV1' in body)
      assert.ok(
        body.openResourceDiscoveryV1.documents.some(
          (document) =>
            document.perspective === 'system-instance' &&
            document.accessStrategies.some((strategy) => strategy.type === 'basic-auth'),
        ),
      )
    })

    it('should return static system-version perspective ORD document without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/open-resource-discovery/v1/documents/system-version',
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as Partial<OrdDocument> & { packages?: { labels?: object }[] }
      assert.ok(body.openResourceDiscovery)
      assert.ok(body.policyLevels?.includes('sap:core:v1'))
      assert.ok(body.entityTypes?.[0]?.lastUpdate)
      assert.ok(body.packages?.[0]?.labels && 'example:customLabel' in body.packages[0].labels)
    })

    it('should require authentication for the system-instance ORD document', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/open-resource-discovery/v1/documents/system-instance',
      })

      assert.equal(response.statusCode, 401)
    })

    it('should reject invalid credentials for the system-instance ORD document', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/open-resource-discovery/v1/documents/system-instance',
        headers: {
          Authorization: `Basic ${invalidCredentials}`,
        },
      })

      assert.equal(response.statusCode, 401)
    })

    for (const [tenantId, credentials] of [
      ['T1', tenantT1Credentials],
      ['T2', tenantT2Credentials],
    ] as const) {
      it(`should infer tenant ${tenantId} from Basic Auth`, async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/open-resource-discovery/v1/documents/system-instance',
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        })

        assert.equal(response.statusCode, 200)
        const body = JSON.parse(response.payload) as { openResourceDiscovery: string; description: string }
        assert.ok(body.openResourceDiscovery)
        assert.ok(body.description.includes(tenantId))
      })
    }

    it('should not let a query parameter override the authenticated tenant', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/open-resource-discovery/v1/documents/system-instance?local-tenant-id=T2',
        headers: {
          Authorization: `Basic ${tenantT1Credentials}`,
        },
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as { description: string }
      assert.ok(body.description.includes('T1'))
      assert.ok(!body.description.includes('T2'))
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle invalid URLs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/invalid-url',
      })

      assert.equal(response.statusCode, 404)
      const error = JSON.parse(response.payload) as ErrorItem
      assert.ok('message' in error)
      assert.ok('statusCode' in error)
    })

    it('should handle invalid methods', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/health/v1',
      })

      assert.equal(response.statusCode, 404)
    })
  })
})
