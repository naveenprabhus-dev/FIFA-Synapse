/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AppError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RepositoryError extends AppError {
  constructor(message: string, code = 'REPOSITORY_ERROR', details?: unknown) {
    super(message, code, details);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, code = 'NETWORK_ERROR', details?: unknown) {
    super(message, code, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR', details?: unknown) {
    super(message, code, details);
  }
}

export class EmptyDataError extends AppError {
  constructor(message: string, code = 'EMPTY_DATA_ERROR', details?: unknown) {
    super(message, code, details);
  }
}
