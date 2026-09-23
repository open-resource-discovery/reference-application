export interface ApiUsersAndPasswords {
  [userName: string]: {
    password: string
    tenantId: string
  }
}

/**
 * Very insecure username and password store for our protected APIs :)
 */
export const apiUsersAndPasswords: ApiUsersAndPasswords = {
  foo: {
    password: 'bar',
    tenantId: 'T1',
  },
  foo2: {
    password: 'bar',
    tenantId: 'T1',
  },
  bar: {
    password: 'foo',
    tenantId: 'T2',
  },
  mariusz: {
      password: 'mariusz1234',
      tenantId: 'T1',
    }
}
