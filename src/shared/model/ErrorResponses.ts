import type { OAS3ResponseObjectDictionary, OAS3SchemaObjectDictionary } from './OpenAPI.ts'

export interface ErrorResponse {
  error: ErrorItem
}

export interface ErrorItem {
  code: string
  message: string
  target?: string
  details?: DetailError[]
}

export interface DetailError {
  code: string
  message: string
}

/**
 * Error Interface JSON Schemas according to SAP API Guidelines
 * TODO: Missing TS interface / error classes
 */
export const errorSchemas: OAS3SchemaObjectDictionary = {
  ErrorResponse: {
    type: 'object',
    title: 'Error Response',
    properties: {
      error: {
        $ref: '#/components/schemas/ErrorItem',
      },
    },
  },
  ErrorItem: {
    type: 'object',
    title: 'Error Item',
    properties: {
      code: {
        type: 'string',
        title: 'Technical code of the error situation to be used for support purposes',
      },
      message: {
        type: 'string',
        title: 'User-facing (localizable) message, describing the error',
      },
      target: {
        type: 'string',
        title: 'Describes the error related data element (e.g. using a resource path)',
      },
      details: {
        type: 'array',
        title: 'Error Details',
        items: {
          $ref: '#/components/schemas/DetailError',
        },
      },
    },
    additionalProperties: true,
    required: ['code', 'message'],
  },
  DetailError: {
    type: 'object',
    title: 'Detail Error',
    description: 'Error data that can be placed in the ErrorItem.details array',
    properties: {
      code: {
        type: 'string',
        title: 'Technical code of the error situation to be used for support purposes',
      },
      message: {
        type: 'string',
        title: 'User-facing (localizable) message, describing the error',
      },
    },
    additionalProperties: true,
    required: ['code', 'message'],
  },
}

export const errorOASResponse304: OAS3ResponseObjectDictionary = {
  '304': {
    description: 'Not Modified',
  },
}

export const errorOASResponse400: OAS3ResponseObjectDictionary = {
  '400': {
    description: 'Bad Request - Invalid User Input.',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        examples: {
          response: {
            value: {
              error: {
                code: 'BAD_REQUEST',
                message: 'The request the client made is incorrect or corrupt, likely due to invalid input.',
              },
            },
          },
        },
      },
    },
  },
}

export const errorOASResponse401: OAS3ResponseObjectDictionary = {
  '401': {
    description: 'Unauthorized - Action requires user authentication.',
    headers: {
      WWW_Authenticate: {
        schema: {
          type: 'string',
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        examples: {
          response: {
            value: {
              error: {
                code: 'UNAUTHORIZED',
                message: 'To access the API, you have to login',
              },
            },
          },
        },
      },
    },
  },
}

export const errorOASResponse403: OAS3ResponseObjectDictionary = {
  '403': {
    description: 'User or client is not authorized to perform the requested operation',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        examples: {
          response: {
            value: {
              error: {
                code: 'FORBIDDEN',
                message: 'User or client is not authorized to perform the requested operation.',
              },
            },
          },
        },
      },
    },
  },
}

export const errorOASResponse404: OAS3ResponseObjectDictionary = {
  '404': {
    description: 'Not found',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        examples: {
          response: {
            value: {
              error: {
                message: 'Requested resource not found.',
                code: 'NOT_FOUND',
                target: '<Resource ID>',
              },
            },
          },
        },
      },
    },
  },
}

export const errorOASResponse500: OAS3ResponseObjectDictionary = {
  '500': {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        examples: {
          response: {
            value: {
              error: {
                message: 'Internal server error occurred.',
                code: 'INTERNAL_SERVER_ERROR',
              },
            },
          },
        },
      },
    },
  },
}
