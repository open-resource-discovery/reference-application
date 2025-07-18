import { FastifyInstance, FastifyRequest, FastifySchema } from 'fastify'
import { OpenAPIV3 } from 'openapi-types'
import { ConstellationData, constellationData } from '../../../../data/astronomy/constellations.js'
import { NotFoundError } from '../../../../error/NotFoundError.js'
import { Constellation, constellationIdSchema, ConstellationsResponse } from '../models/Constellation.js'

export const constellationsResourceName = 'constellations'
export const openApiPaths: OpenAPIV3.PathsObject = {}

/**
 * Constellations related HTTP operations
 */
export function constellationsResource(fastify: FastifyInstance): void {
  fastify.get('/', {}, getConstellationsHandler)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  fastify.get('/:id', { schema: getConstellationsByIdSchema }, getConstellationByIdHandler)
}

//////////////////////////////////////////
// GET /constellations                  //
//////////////////////////////////////////

function getConstellationsHandler(): ConstellationsResponse {
  return { value: mapConstellationData(constellationData) }
}

export const getConstellationsPath = `/${constellationsResourceName}`

openApiPaths[getConstellationsPath] = {
  get: {
    operationId: 'getConstellations',
    summary: 'Returns a list of constellations.',
    description: 'Longer description of this API Operation...',
    tags: [constellationsResourceName],
    responses: {
      200: {
        description: 'A JSON array of constellations',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ConstellationsResponse',
            },
            example: {
              value: [
                {
                  id: 'And',
                  name: 'Andromeda',
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
// GET /constellations/:id              //
//////////////////////////////////////////

const getConstellationsByIdSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: constellationIdSchema,
    },
  },
}

interface GetConstellationsByIdParams {
  id: string
}

function getConstellationByIdHandler(req: FastifyRequest<{ Params: GetConstellationsByIdParams }>): Constellation {
  const constellations = mapConstellationData(constellationData)
  const found = constellations.find((el) => el.id === req.params.id)
  if (found) {
    return found
  } else {
    throw new NotFoundError(`Could not find constellation with ID: ${req.params.id}`, req.params.id)
  }
}

export const getConstellationPath = `/${constellationsResourceName}/{id}`

openApiPaths[getConstellationPath] = {
  get: {
    operationId: 'getConstellation',
    summary: 'Returns a specific constellations.',
    description: 'Longer description of this API Operation...',
    tags: [constellationsResourceName],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID of constellation to discover',
        schema: {
          $ref: '#/components/schemas/Constellation/properties/id',
        },
      },
    ],
    responses: {
      200: {
        description: 'The requested constellation JSON',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Constellation',
            },
            example: {
              id: 'And',
              name: 'Andromeda',
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
 * Maps original ConstellationData to Constellation API Model
 */
export function mapConstellationData(originalConstellationData: ConstellationData[]): Constellation[] {
  return originalConstellationData.map((el) => {
    return {
      id: el.abbr,
      name: el.name,
    }
  })
}
