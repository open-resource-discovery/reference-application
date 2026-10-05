/**
 * This is a typical health check API for health probes
 * as used by CloudFoundry or K8s
 */
export function getHealthCheckV1(): string {
  return 'OK'
}
