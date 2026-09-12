import { BackendError } from '../shared/error/BackendError.ts'
import type { DetailError } from '../shared/model/ErrorResponses.ts'

export class UnauthorizedError extends BackendError {
  name = 'UnauthorizedError'
  httpStatusCode = 401
  constructor(message: string, target?: string, details?: DetailError[]) {
    super(message, 'UNAUTHORIZED', target, details)
  }
}
