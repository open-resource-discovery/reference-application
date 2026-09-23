import { LOCAL_URL, PUBLIC_URL } from '../../../config.ts'
import {
  errorOASResponse400,
  errorOASResponse404,
  errorOASResponse500,
  errorSchemas,
} from '../../../shared/model/ErrorResponses.ts'
import type { SapOpenApiDocument } from '../../../shared/model/OpenAPI.ts'
import { constellationSchema, constellationsResponseSchema } from './models/Constellation.ts'
import { openApiPaths } from './resources/constellations.ts'

const apiName = 'ISS Astronomy API'
const apiNamespace = 'otheriss'
const apiMajorVersion = 'v1'
const apiEntryPoint = `${apiNamespace}/${apiMajorVersion}`
const apiVersion = '1.0.3' // full semver API version

export const astronomyV1ApiConfig = {
  apiName,
  apiNamespace,
  apiMajorVersion,
  apiEntryPoint,
  apiVersion,
}

export function getAstronomyV1ApiDefinition(): SapOpenApiDocument {
  return {
    openapi: '3.0.0',
    info: {
      title: apiName,
      description: 'This is just a sample API',
      version: apiVersion,
    },
    'x-sap-shortText': 'Explore constellations and retrieve their astronomical names.',
    externalDocs: {
      description: 'Astronomy API documentation',
      url: 'https://github.com/open-resource-discovery/reference-application/tree/main/src/api/astronomy/v1',
    },
    servers: [
      {
        url: `${PUBLIC_URL}/${apiEntryPoint}`,
      },
      {
        url: `${LOCAL_URL}/${apiEntryPoint}`,
      },
    ],
    tags: [
      {
        name: 'constellations',
        description: 'Constellations',
      },
    ],
    paths: {
      ...openApiPaths,
    },
    components: {
      securitySchemes: {
        optionalBasicAuth: {
          type: 'http',
          scheme: 'basic',
          description: 'Authentication is optional because the Astronomy API is publicly accessible.',
        },
      },
      schemas: {
        Constellation: constellationSchema,
        ConstellationsResponse: constellationsResponseSchema,
        ...errorSchemas,
      },
      responses: {
        ...errorOASResponse400,
        ...errorOASResponse404,
        ...errorOASResponse500,
      },
    },
  }
}
