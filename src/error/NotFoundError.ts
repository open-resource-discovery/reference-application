import { BackendError } from '../shared/error/BackendError.js'
import type { DetailError } from '../shared/model/ErrorResponses.js'

export class NotFoundError extends BackendError {
  name = 'NotFoundError'
  httpStatusCode = 404
  constructor(message: string, target?: string, details?: DetailError[]) {
    super(message, 'NOT_FOUND', target, details)
  }
}
