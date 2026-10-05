import { BackendError } from '../shared/error/BackendError.ts'
import { InternalServerError } from './InternalServerError.ts'
import { UnauthorizedError } from './UnauthorizedError.ts'

/**
 * This error handler will convert the various kind of errors that could happen
 * into SAP API Harmonization Guideline compatible Error Responses
 *
 * Please be aware that this is simplified and not as complete as it could be.
 */

export function getHttpError(err: unknown): BackendError {
  /** We always cast incoming errors into our own error classes */
  let castedError: BackendError

  if (err instanceof BackendError) {
    // The error is already one of our own custom errors, no casting necessary
    castedError = err
  } else if (err instanceof Error && err.name === 'UnauthorizedError') {
    castedError = new UnauthorizedError(err.message)
  } else {
    // Handle generic errors we couldn't handle so far
    const message = err instanceof Error ? err.message : String(err)
    castedError = new InternalServerError(`Internal Server error: ${message}`)
  }

  return castedError
}
