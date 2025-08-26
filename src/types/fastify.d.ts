import 'fastify'
import { TenantConfiguration } from '../data/user/tenants.ts'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userName: string
      tenantId: string
      tenantConfiguration: TenantConfiguration
    }
  }
  export interface FastifyQueryParameters {
    [key: string]: string
  }
}
