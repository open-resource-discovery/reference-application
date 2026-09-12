import type { OpenAPIV3 } from 'openapi-types'

/**
 * A Constellation is a group of stars forming a recognizable pattern
 * that is traditionally named after its apparent form or identified
 * with a mythological figure.
 */
export interface Constellation {
  /**
   * Name of the Constellation
   */
  name: string

  /**
   * ID (also abbreviation)
   */
  id: string
}

export const constellationIdSchema: OpenAPIV3.SchemaObject = {
  type: 'string',
  description: 'ID (also abbreviation)',
  maxLength: 3,
}

/**
 * The JSON Schema that is used to validate and describe Constellation
 * at run-time or via the OpenAPI Definition.
 *
 * TODO: In an ideal application, the Schema would be either automatically derived
 * from the interfaces / classes of the model itself, or vice versa.
 * At least there should be tests that verify that the Schema / Definition matches the
 * TS interfaces and the actual implementation.
 */
export const constellationSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Name of the Constellation',
    },
    id: constellationIdSchema,
  },
  required: ['name', 'id'],
  additionalProperties: false,
  description:
    'A Constellation is a group of stars forming a recognizable pattern that is traditionally named after its apparent form or identified with a mythological figure.',
}

/**
 * Response returning a list of constellations
 */
export interface ConstellationsResponse {
  value: Constellation[]
}

export const constellationsResponseSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    value: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Constellation',
      },
    },
  },
  required: ['value'],
  additionalProperties: false,
  description: 'Response returning a list of constellations',
}
