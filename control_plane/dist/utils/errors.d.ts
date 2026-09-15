/**
 * Error handling and retry logic for control plane components
 */
import { IncidentState } from "../types";
export interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    timeoutMs: number;
}
export declare const DEFAULT_RETRY_CONFIG: RetryConfig;
export declare function executeWithRetry<T>(operation: () => Promise<T>, config?: RetryConfig, component?: string): Promise<T>;
export declare function sleep(ms: number): Promise<void>;
export declare function createErrorLog(error: Error, component: string, incident_id: string, context?: Record<string, any>): Record<string, any>;
export declare function determineNextStateOnError(error: Error, currentState: IncidentState): IncidentState;
//# sourceMappingURL=errors.d.ts.map