import type { DetailError, ErrorItem, ErrorResponse } from '../model/ErrorResponses.ts'

/**
 * Base class for all custom errors
 */
export abstract class BackendError extends Error {
  name = 'BackendError'

  /**
   * The HTTP response status code that this error should result in
   * We default to 500 if we don't know better.
   */
  httpStatusCode = 500

  /**
   * The HTTP response error item
   *
   * Will be wrapped in Error Response later
   */
  errorItem: ErrorItem

  constructor(message: string, code?: string, target?: string, details?: DetailError[]) {
    super(message)
    this.name = 'BackendError'
    this.errorItem = {
      message: message,
      code: code ?? 'INTERNAL_SERVER_ERROR',
    }
    if (target) {
      this.errorItem.target = target
    }
    if (details) {
      this.errorItem.details = details
    }
  }

  getErrorResponse(): ErrorResponse {
    return {
      error: this.errorItem,
    }
  }

  getHttpStatusCode(): number {
    return this.httpStatusCode
  }
}
