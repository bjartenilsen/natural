/**
 * Reusable type guard utilities for error type checking
 */

import { AppError } from '../types/ErrorTypes';

/**
 * Check if an unknown value is an AppError
 */
export function isAppError(e: unknown): e is AppError {
  return e != null && typeof e === 'object' && 'type' in e;
}

/**
 * Check if an unknown value is an AppError of a specific type
 */
export function isAppErrorOfType<T extends AppError['type']>(
  e: unknown,
  type: T
): boolean {
  return isAppError(e) && e.type === type;
}
