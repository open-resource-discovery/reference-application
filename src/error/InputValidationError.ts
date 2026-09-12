import { BackendError } from '../shared/error/BackendError.js'
import type { DetailError } from '../shared/model/ErrorResponses.js'

/**
 * Error for invalid user input
 * Ideally we check the request input via OpenAPI Definition or at least via JSON Schema validation
 */
export class InputValidationError extends BackendError {
  name = 'InputValidationError'
  httpStatusCode = 400
  constructor(message: string, target?: string, details?: DetailError[]) {
    super(message, 'INVALID_USER_INPUT', target, details)
  }
}
