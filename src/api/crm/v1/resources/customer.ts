import type { OpenAPIV3 } from 'openapi-types'
import { type CustomerData, customerData } from '../../../../data/customer/customers.ts'
import { NotFoundError } from '../../../../error/NotFoundError.ts'
import type { UserInfo } from '../../../shared/validateUserAuthorization.ts'
import type { Customer, CustomersResponse } from '../models/Customer.ts'

export const customersResourceName = 'customers'
export const openApiPaths: OpenAPIV3.PathsObject = {}

//////////////////////////////////////////
// GET /customers                  //
//////////////////////////////////////////

export function getCustomers(user: UserInfo): CustomersResponse {
  return { value: mapCustomerData(customerData[user.tenantId] || []) }
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

export function getCustomerById(user: UserInfo, id: number): Customer {
  const customers = mapCustomerData(customerData[user.tenantId])
  const found = customers.find((el) => el.id === id)
  if (found) {
    return found
  } else {
    throw new NotFoundError(`Could not find customer with ID: ${id}`, id.toString())
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
