import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { OrdDocument } from '@open-resource-discovery/specification'
import type { Constellation } from '../api/astronomy/v1/models/Constellation.ts'
import type { SapEventCatalog } from '../event/shared/SapEventCatalog.ts'
import type { ErrorItem } from '../shared/model/ErrorResponses.ts'
import type { SapOpenApiDocument } from '../shared/model/OpenAPI.ts'
import { inject } from './testClient.ts'

describe('Server Integration Tests', () => {
  const app = { inject }

  describe('Astronomy API Integration', () => {
    it('should retrieve constellations list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/astronomy/v1/constellations',
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as { value: Constellation[] }
      assert.ok('value' in body)
      assert.ok(Array.isArray(body.value))
      assert.ok(body.value.length > 0)
      assert.ok('id' in body.value[0])
      assert.ok('name' in body.value[0])
    })

    it('should retrieve a specific constellation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/astronomy/v1/constellations/And',
      })

      assert.equal(response.statusCode, 200)
      const constellation = JSON.parse(response.payload) as { value: Constellation[] }
      assert.deepEqual(constellation, {
        id: 'And',
        name: 'Andromeda',
      })
    })

    it('should publish SAP-compliant OpenAPI metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/astronomy/v1/openapi/oas3.json',
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as SapOpenApiDocument
      assert.equal(body['x-sap-shortText'], 'Explore constellations and retrieve their astronomical names.')
      assert.ok(body.externalDocs?.url)
      assert.ok(body.components?.securitySchemes?.optionalBasicAuth)
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

      assert.equal(response.statusCode, 401)
      assert.match(response.headers.get('www-authenticate') ?? '', /^Basic /)
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

    it('should support HEAD and trailing slashes', async () => {
      const response = await app.inject({
        method: 'HEAD',
        url: '/health/v2/',
      })

      assert.equal(response.statusCode, 200)
      assert.equal(response.payload, '')
      assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8')
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

    it('should support conditional requests with an ETag', async () => {
      const firstResponse = await app.inject({
        method: 'GET',
        url: '/open-resource-discovery/v1/documents/system-version',
      })
      const etag = firstResponse.headers.get('etag')
      assert.ok(etag)

      const cachedResponse = await app.inject({
        method: 'GET',
        url: '/open-resource-discovery/v1/documents/system-version',
        headers: { 'if-none-match': etag },
      })
      assert.equal(cachedResponse.statusCode, 304)
      assert.equal(cachedResponse.payload, '')
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

  describe('Event Catalog Integration', () => {
    it('should return event catalog definition', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/sap-events/v1/odm-finance-costobject.asyncapi2.json',
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as SapEventCatalog
      assert.ok(body.asyncapi)
      assert.ok(body.channels)
      assert.equal(body['x-sap-shortText'], 'Publish example finance cost center events.')
      assert.ok(
        body.components.messages.sap_odm_finance_costobject_CostCenter_Created_v1['x-sap-event-characteristics'],
      )
      assert.ok(body.components.messageTraits.CloudEventsContext['x-sap-event-source-parameters'])
      assert.equal(
        body.components.messageTraits.CloudEventsContext.headers.properties.source.const,
        '/default/sap.foo.bar/public',
      )
    })

    it('should return tenant-specific event catalog', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/sap-events/v1/odm-finance-costobject.asyncapi2.json',
        headers: {
          'local-tenant-id': 'T1',
        },
      })

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.payload) as SapEventCatalog
      assert.ok(body.asyncapi)
      assert.ok(body.channels)
      assert.equal(
        body.components.messageTraits.CloudEventsContext.headers.properties.source.const,
        '/default/sap.foo.bar/T1',
      )
    })

    it('should reject unknown tenant identifiers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/sap-events/v1/odm-finance-costobject.asyncapi2.json?local-tenant-id=unknown',
      })

      assert.equal(response.statusCode, 401)
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
