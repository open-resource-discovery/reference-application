import type { OpenAPIV3 } from 'openapi-types'

/**
 * A Customer is a group of stars forming a recognizable pattern
 * that is traditionally named after its apparent form or identified
 * with a mythological figure.
 */
export interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  /** Custom field extensions as exposed by the API */
  extensions?: {
    [fieldName: string]: string | number
  }
}

export const customerIdSchema: OpenAPIV3.SchemaObject = {
  type: 'number',
  description: 'ID of the customer',
  minimum: 0,
}

/**
 * The JSON Schema that is used to validate and describe Customer
 * at run-time or via the OpenAPI Definition.
 *
 * TODO: In an ideal application, the Schema would be either automatically derived
 * from the interfaces / classes of the model itself, or vice versa.
 * At least there should be tests that verify that the Schema / Definition matches the
 * TS interfaces and the actual implementation.
 */
export const customerSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'A customer',
  properties: {
    id: customerIdSchema,
    firstName: {
      type: 'string',
      description: 'First name of the customer',
    },
    lastName: {
      type: 'string',
      description: 'Last name of the customer',
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'First name of the customer',
    },
  },
  required: ['id', 'firstName', 'lastName', 'email'],
  additionalProperties: false,
}

/**
 * Response returning a list of customers
 */
export interface CustomersResponse {
  value: Customer[]
}

export const customersResponseSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    value: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Customer',
      },
    },
  },
  required: ['value'],
  additionalProperties: false,
  description: 'Response returning a list of customers',
}
