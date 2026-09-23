import { getEventSource } from '../../shared/eventConfig.ts'
import type { SapEventCatalog } from '../../shared/SapEventCatalog.ts'
import { costCenterCreatedType } from './CostCenter.ts'

const eventResourceName = 'iss-odm-finance-costobject'
const eventResourceTitle = 'ISS-ODM Finance Cost Center Events'
const eventResourceDescription =
  'This is an example event catalog that contains only a partial ODM finance cost center V1 event'
const eventResourceMajorVersion = 'v0'
const eventResourceVersion = '0.1.0' // full semver API version

export const odmFinanceCostObjectEventConfig = {
  eventResourceName,
  eventResourceTitle,
  eventResourceDescription,
  eventResourceMajorVersion,
  eventResourceVersion,
}

/**
 * This function returns an SAP Event Catalog document
 * Since we are a multi-tenant application, the `source` const value
 * includes a tenant ID. Therefore it needs to be passed as an argument.
 *
 * This makes the SAP Event Catalog document system instance aware.
 */
export function getOdmCostObjectSapEventCatalogDefinition(tenantId?: string): SapEventCatalog {
  const eventCatalog: SapEventCatalog = {
    asyncapi: '2.0.0',
    'x-sap-catalog-spec-version': '1.1',
    'x-sap-shortText': 'Publish example finance cost center events.',
    info: {
      title: eventResourceTitle,
      version: eventResourceVersion,
      description: eventResourceDescription,
    },
    channels: {
      'default/sap.foo.bar/123456/ce/sap/odm/finance/costobject/CostCenter/Created/v1': {
        subscribe: {
          message: {
            $ref: '#/components/messages/sap_odm_finance_costobject_CostCenter_Created_v1',
          },
        },
      },
    },
    components: {
      messages: {
        sap_odm_finance_costobject_CostCenter_Created_v1: {
          name: costCenterCreatedType,
          'x-sap-event-characteristics': {
            'instance-identification': 'key-subject',
            sequencing: 'instance-precedence',
            'state-transfer': 'full-after-image',
          },
          headers: {
            properties: {
              type: {
                const: costCenterCreatedType,
              },
            },
          },
          payload: {
            $ref: '#/components/schemas/sap_odm_finance_costobject_CostCenter_Created_v1',
          },
          traits: [
            {
              $ref: '#/components/messageTraits/CloudEventsContext',
            },
          ],
        },
      },
      schemas: {
        sap_odm_finance_costobject_CostCenter_Created_v1: {
          description: 'The CostCenter.Created.v1 payload. The JSON Schema here is INCOMPLETE',
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
      },
      messageTraits: {
        CloudEventsContext: {
          'x-sap-event-source': '/{region}/sap.foo.bar/{instanceId}',
          'x-sap-event-source-parameters': {
            region: {
              description: 'The region in which the application is deployed.',
              schema: {
                type: 'string',
              },
            },
            instanceId: {
              description: 'The local tenant identifier.',
              schema: {
                type: 'string',
              },
            },
          },
          headers: {
            type: 'object',
            properties: {
              id: {
                description: 'Identifies the event.',
                type: 'string',
                minLength: 1,
                examples: ['6925d08e-bc19-4ad7-902e-bd29721cc69b'],
              },
              source: {
                description: 'Identifies the context in which an event happened.',
                type: 'string',
                const: getEventSource(tenantId || 'public'),
                format: 'uri-reference',
                minLength: 7,
                maxLength: 64,
                pattern:
                  '^/(?!ce/)([a-zA-Z0-9][a-zA-Z0-9.-]{0,8}[a-zA-Z0-9])/(?!ce/)(?!ce$)(?=.{3,15}(/|$))([a-z][a-z0-9]*([.][a-z][a-z0-9]*)+)(?=.{0,37}$)(?!/ce$)(/([a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])*$)|$)',
              },
              specversion: {
                description: 'The version of the CloudEvents specification which the event uses.',
                type: 'string',
                const: '1.0',
              },
              type: {
                description: 'Describes the type of event related to the originating occurrence.',
                type: 'string',
                minLength: 10,
                maxLength: 83,
                pattern:
                  '^(?=^.{10,83}$)([a-z][a-z0-9]*([.][a-z][a-z0-9]*)+)[.]([a-zA-Z0-9]+)[.]([a-zA-Z0-9]+)[.](v[0-9]+)$',
              },
              datacontenttype: {
                description: 'Content type of the data value. Must adhere to RFC 2046 format.',
                type: 'string',
                const: 'application/json',
              },
              dataschema: {
                description: 'Identifies the schema that data adheres to.',
                type: 'string',
                format: 'uri',
              },
              subject: {
                description:
                  'Describes the subject of the event in the context of the event producer (identified by source).',
                type: 'string',
                minLength: 1,
                maxLength: 256,
                examples: ['ce307052-75a0-4a8f-a961-ebf21669bb80'],
              },
              time: {
                description: 'Timestamp of when the occurrence happened. Must adhere to RFC 3339.',
                format: 'date-time',
                type: 'string',
                examples: ['2018-04-05T17:31:00Z'],
              },
              sappassport: {
                description:
                  'SAP specific tracing header. Also relevant for Integration Monitoring, see TG11.R1: Implement SAP Passport.',
                type: 'string',
                minLength: 1,
              },
            },
            required: ['id', 'source', 'specversion', 'type'],
            patternProperties: {
              '^xsap[a-z0-9]+$': {
                description: 'Application defined custom extension context attributes.',
                type: ['boolean', 'integer', 'string'],
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
  }
  return eventCatalog
}
