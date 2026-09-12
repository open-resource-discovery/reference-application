import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { BackendError } from '../shared/error/BackendError.ts'
import { InputValidationError } from './InputValidationError.ts'
import { InternalServerError } from './InternalServerError.ts'
import { UnauthorizedError } from './UnauthorizedError.ts'

/**
 * This error handler will convert the various kind of errors that could happen
 * into SAP API Harmonization Guideline compatible Error Responses
 *
 * Please be aware that this is simplified and not as complete as it could be.
 */

export function errorHandler(err: FastifyError, req: FastifyRequest, reply: FastifyReply): void {
  /** We always cast incoming errors into our own error classes */
  let castedError: BackendError

  if (err instanceof BackendError) {
    // The error is already one of our own custom errors, no casting necessary
    castedError = err
  } else if (err.message && err.validation) {
    // Duck type for Fastify Validation Error
    const dataPath = err.validation[0]?.instancePath

    castedError = new InputValidationError(err.message, dataPath)
  } else if (err.name === 'UnauthorizedError' || err.code === 'FST_BASIC_AUTH_MISSING_OR_BAD_AUTHORIZATION_HEADER') {
    castedError = new UnauthorizedError(err.message)
  } else {
    // Handle generic errors we couldn't handle so far
    castedError = new InternalServerError(`Internal Server error: ${err.message}`)
  }

  req.log.error({ error: castedError.getErrorResponse() }, `ERROR ${castedError.getHttpStatusCode()}`)

  reply
    .code(castedError.getHttpStatusCode())
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(castedError.getErrorResponse())
}
