import { BackendError } from '../shared/error/BackendError.js'
import type { DetailError } from '../shared/model/ErrorResponses.js'

/**
 * Internal Server Error
 * Use this only as a fallback if no more specific error is available
 */
export class InternalServerError extends BackendError {
  name = 'InternalServerError'
  httpStatusCode = 500
  constructor(message: string, target?: string, details?: DetailError[]) {
    super(message, 'INTERNAL_SERVER_ERROR', target, details)
  }
}
