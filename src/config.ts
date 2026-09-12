export const PORT = parseInt(process.env.PORT || '8080', 10)
export const LOCAL_URL = `http://localhost:${PORT}`

const DEFAULT_PUBLIC_URL = 'https://ord-reference-application.cfapps.sap.hana.ondemand.com'

export function getPublicUrl(environment: NodeJS.ProcessEnv = process.env): string {
  return environment.PUBLIC_URL || DEFAULT_PUBLIC_URL
}

export const PUBLIC_URL = getPublicUrl()
