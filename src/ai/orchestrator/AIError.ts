/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppError } from '../../utils/errors';

export class AIError extends AppError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, details);
  }
}

export class APIError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_API_ERROR', details);
  }
}

export class RateLimitError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_RATE_LIMIT_ERROR', details);
  }
}

export class TimeoutError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_TIMEOUT_ERROR', details);
  }
}

export class InvalidResponseError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_INVALID_RESPONSE_ERROR', details);
  }
}

export class NetworkFailureError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_NETWORK_FAILURE_ERROR', details);
  }
}

export class MalformedJSONError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_MALFORMED_JSON_ERROR', details);
  }
}
