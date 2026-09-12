import { describe, expect, it } from '@jest/globals'
import { getPublicUrl } from '../config.js'

describe('Configuration', () => {
  it('uses the deployed application URL by default', () => {
    expect(getPublicUrl({})).toBe('https://ord-reference-application.cfapps.sap.hana.ondemand.com')
  })

  it('allows the public URL to be overridden for local crawls', () => {
    expect(getPublicUrl({ PUBLIC_URL: 'http://127.0.0.1:8080' })).toBe('http://127.0.0.1:8080')
  })
})
