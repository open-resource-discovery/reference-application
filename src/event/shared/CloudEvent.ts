/**
 * SAP Event (based on CloudEvents) TS Interface
 *
 * @see https://cloudevents.io/
 * @see https://github.com/cloudevents/spec/blob/v1.0.1/spec.md
 * */
export interface CloudEvent<Data = unknown> {
  /**
   * The event payload.
   */
  data?: Data
  /**
   * Base64 encoded event payload. Must adhere to RFC4648.
   */
  data_base64?: null | string
  /**
   * Content type of the data value. Must adhere to RFC 2046 format.
   */
  datacontenttype?: null | string
  /**
   * Identifies the schema that data adheres to.
   */
  dataschema?: null | string
  /**
   * Identifies the event.
   */
  id: string
  /**
   * SAP specific tracing header. Also relevant for Integration Monitoring, see TG11.R1:
   * Implement SAP Passport.
   */
  sappassport?: null | string
  /**
   * Identifies the context in which an event happened.
   */
  source: string
  /**
   * The version of the CloudEvents specification which the event uses.
   */
  specversion: string
  /**
   * Describes the subject of the event in the context of the event producer (identified by
   * source).
   */
  subject?: null | string
  /**
   * Timestamp of when the occurrence happened. Must adhere to RFC 3339.
   */
  time?: Date | null
  /**
   * Describes the type of event related to the originating occurrence.
   */
  type: string
}
