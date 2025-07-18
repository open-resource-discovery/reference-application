import { FastifyInstance, FastifyRequest, FastifySchema } from 'fastify'
import { fastifyBasicAuth } from '@fastify/basic-auth'
import { OpenAPIV3 } from 'openapi-types'
import { CustomerData, customerData } from '../../../../data/customer/customers.js'
import { NotFoundError } from '../../../../error/NotFoundError.js'
import { basicAuthConfig } from '../../../shared/validateUserAuthorization.js'
import { Customer, customerIdSchema, CustomersResponse } from '../models/Customer.js'

export const customersResourceName = 'customers'
export const openApiPaths: OpenAPIV3.PathsObject = {}

/**
 * Customers related HTTP operations
 */
export async function customersResource(fastify: FastifyInstance): Promise<void> {
  // Register our basic authentication
  await fastify.register(fastifyBasicAuth, basicAuthConfig)
  fastify.addHook('onRequest', fastify.basicAuth)
  fastify.get('/', {}, getCustomersHandler)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  fastify.get('/:id', { schema: getCustomersByIdSchema }, getCustomerByIdHandler)
}

//////////////////////////////////////////
// GET /customers                  //
//////////////////////////////////////////

function getCustomersHandler(req: FastifyRequest): CustomersResponse {
  if (!req.user || !req.user.tenantId) {
    throw new NotFoundError('No user / tenant ID provided')
  } else {
    return { value: mapCustomerData(customerData[req.user.tenantId] || []) }
  }
}

export const getCustomersPath = `/${customersResourceName}`

openApiPaths[getCustomersPath] = {
  get: {
    operationId: 'getCustomers',
    summary: 'Returns a list of customers.',
    description: 'Longer description of this API Operation...',
    tags: [customersResourceName],
    responses: {
      200: {
        description: 'A JSON array of customers',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CustomersResponse',
            },
            example: {
              value: [
                {
                  id: 1,
                  firstName: 'Hans',
                  lastName: 'Wurst',
                  email: 'hanswurst@example.com',
                },
              ],
            },
          },
        },
      },
      500: {
        $ref: '#/components/responses/500',
      },
    },
  },
}

//////////////////////////////////////////
// GET /customers/:id              //
//////////////////////////////////////////

const getCustomersByIdSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: customerIdSchema,
    },
  },
}

interface GetCustomersByIdParams {
  id: number
}

function getCustomerByIdHandler(req: FastifyRequest<{ Params: GetCustomersByIdParams }>): Customer {
  if (!req.user || !req.user.tenantId) {
    throw new NotFoundError('No user / tenant ID provided', req.params.id.toString())
  }
  const customers = mapCustomerData(customerData[req.user.tenantId])
  const found = customers.find((el) => el.id === req.params.id)
  if (found) {
    return found
  } else {
    throw new NotFoundError(`Could not find customer with ID: ${req.params.id}`, req.params.id.toString())
  }
}

export const getCustomerPath = `/${customersResourceName}/{id}`

openApiPaths[getCustomerPath] = {
  get: {
    operationId: 'getCustomer',
    summary: 'Returns a specific customers.',
    description: 'Longer description of this API Operation...',
    tags: [customersResourceName],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID of customer to discover',
        schema: {
          $ref: '#/components/schemas/Customer/properties/id',
        },
      },
    ],
    responses: {
      200: {
        description: 'The requested customer data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Customer',
            },
            example: {
              id: 1,
              firstName: 'Hans',
              lastName: 'Wurst',
              email: 'hanswurst@example.com',
            },
          },
        },
      },
      400: {
        $ref: '#/components/responses/400',
      },
      404: {
        $ref: '#/components/responses/404',
      },
      500: {
        $ref: '#/components/responses/500',
      },
    },
  },
}

/**
 * Maps original CustomerData to Customer API Model
 */
export function mapCustomerData(originalCustomerData: CustomerData[]): Customer[] {
  return originalCustomerData.map((el) => {
    return {
      id: el.id,
      firstName: el.first_name,
      lastName: el.last_name,
      email: el.email,
      extensions: el.extensions, // Expose field extensions to the API
    }
  })
}
