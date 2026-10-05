/**
 * This is a typical health check API for health probes
 * as used by CloudFoundry or K8s
 */
export function getHealthCheckV2(): { status: string } {
  return {
    status: 'OK',
  }
}
