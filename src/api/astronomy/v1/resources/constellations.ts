import type { OpenAPIV3 } from 'openapi-types'
import { type ConstellationData, constellationData } from '../../../../data/astronomy/constellations.ts'
import { NotFoundError } from '../../../../error/NotFoundError.ts'
import type { Constellation, ConstellationsResponse } from '../models/Constellation.ts'

export const constellationsResourceName = 'constellations'
export const openApiPaths: OpenAPIV3.PathsObject = {}

//////////////////////////////////////////
// GET /constellations                  //
//////////////////////////////////////////

export function getConstellations(): ConstellationsResponse {
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

export function getConstellationById(id: string): Constellation {
  const constellations = mapConstellationData(constellationData)
  const found = constellations.find((el) => el.id === id)
  if (found) {
    return found
  } else {
    throw new NotFoundError(`Could not find constellation with ID: ${id}`, id)
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
