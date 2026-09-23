/**
 * Tenant configuration
 */
export const tenants: Tenants = {
  /** Tenant T1 has all APIs enabled and a field extension on the customer entity type */
  T1: {
    enabledApis: ['crm'],
    fieldExtensions: {
      Customer: {
        customT1Field1: {
          type: 'string',
          description: 'Custom Field 1 (added by Tenant T1)',
        },
      },
    },
  },
  /** Tenant T2 has not enabled or bought the CRM API functionality */
  T2: {
    //
    enabledApis: [],
  },
}

export interface Tenants {
  [tenantId: string]: TenantConfiguration
}

export interface TenantConfiguration {
  /** APIs that have been enabled for this tenant. Health is always available. */
  enabledApis: 'crm'[]
  /** Additional field extensions (will result in customer specific properties in API interfaces) */
  fieldExtensions?: {
    /** Customer Entity Type */
    Customer?: {
      [fieldName: string]: {
        type: 'string' | 'number'
        description: string
      }
    }
  }
}
