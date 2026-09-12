import { OpenAPIV3 } from 'openapi-types'

export interface SapOpenApiDocument extends OpenAPIV3.Document {
  'x-sap-shortText': string
}

export type OAS3SchemaObjectDictionary = { [key: string]: OpenAPIV3.SchemaObject }
export type OAS3ResponseObjectDictionary = { [key: string]: OpenAPIV3.ResponseObject }
