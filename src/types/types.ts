import { FastifyRequest } from 'fastify'

export type CustomRequest = FastifyRequest<{
  Querystring: {
    'local-tenant-id': string
    'global-tenant-id': string
  }
}>
