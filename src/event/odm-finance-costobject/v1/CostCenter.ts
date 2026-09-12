import { randomUUID } from 'node:crypto'
import type { CloudEvent } from '../../shared/CloudEvent.ts'
import { getEventSource } from '../../shared/eventConfig.ts'

/**
 * This is an incomplete and inofficial CostCenter Created event payload interface
 * based on the ODM CostCenter entity
 */
export interface CostCenterCreated {
  displayName: string
  // this payload is incomplete. Just giving one property as an example.
}

export const costCenterCreatedType = 'sap.odm.finance.costobject.CostCenter.Created.v1'

/**
 * This is a noop function that would send the event occurrence to a subscriber / event broker
 * in the CloudEvent standard format
 */
export function sendCostCenterCreated(
  payload: CostCenterCreated,
  subject: string,
  tenantId: string,
): CloudEvent<CostCenterCreated> {
  const cloudEvent = {
    specversion: '1.0',
    id: randomUUID(),
    source: getEventSource(tenantId),
    type: costCenterCreatedType,
    subject: subject,
    datacontenttype: 'application/json',
    data: payload,
  }

  // In a real application, we would now send the event over the wire :)

  return cloudEvent
}
