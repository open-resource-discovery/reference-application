import { BackendError } from '../shared/error/BackendError.ts'
import type { DetailError } from '../shared/model/ErrorResponses.ts'

export class NotFoundError extends BackendError {
  name = 'NotFoundError'
  httpStatusCode = 404
  constructor(message: string, target?: string, details?: DetailError[]) {
    super(message, 'NOT_FOUND', target, details)
  }
}
