import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getPublicUrl } from '../config.ts'

describe('Configuration', () => {
  it('uses the deployed application URL by default', () => {
    assert.equal(getPublicUrl({}), 'https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com')
  })

  it('allows the public URL to be overridden for local crawls', () => {
    assert.equal(getPublicUrl({ PUBLIC_URL: 'http://127.0.0.1:8080' }), 'http://127.0.0.1:8080')
  })
})
