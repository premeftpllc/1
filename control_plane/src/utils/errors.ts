/**
 * Error handling and retry logic for control plane components
 */

import {
  IncidentProcessingError,
  RetryableError,
  EscalationError,
  IncidentState
} from "../types";

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  timeoutMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 2000,
  maxDelayMs: 16000,
  backoffMultiplier: 2,
  timeoutMs: 30000
};

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  component: string = "unknown"
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timeout after ${config.timeoutMs}ms`)),
          config.timeoutMs
        )
      );

      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof EscalationError) {
        throw error;
      }

      if (attempt < config.maxRetries) {
        console.warn(
          `[${component}] Attempt ${attempt + 1} failed: ${lastError.message}. ` +
          `Retrying in ${delay}ms...`
        );
        await sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
      }
    }
  }

  throw new RetryableError(
    "MAX_RETRIES_EXCEEDED",
    component,
    `Failed after ${config.maxRetries} retries: ${lastError?.message}`
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createErrorLog(
  error: Error,
  component: string,
  incident_id: string,
  context?: Record<string, any>
): Record<string, any> {
  const isProcessingError = error instanceof IncidentProcessingError;

  return {
    timestamp: new Date().toISOString(),
    component,
    incident_id,
    error_name: error.name,
    error_message: error.message,
    error_code: isProcessingError ? (error as IncidentProcessingError).code : "UNKNOWN",
    escalation_required: isProcessingError
      ? (error as IncidentProcessingError).escalation_required
      : false,
    context: context || {},
    stack: error.stack
  };
}

export function determineNextStateOnError(
  error: Error,
  currentState: IncidentState
): IncidentState {
  if (error instanceof EscalationError) {
    return IncidentState.ESCALATED;
  }

  if (error instanceof RetryableError) {
    // Remain in current state for transient errors
    return currentState;
  }

  // For unknown errors, escalate
  return IncidentState.ESCALATED;
}
