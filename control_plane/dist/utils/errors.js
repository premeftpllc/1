"use strict";
/**
 * Error handling and retry logic for control plane components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RETRY_CONFIG = void 0;
exports.executeWithRetry = executeWithRetry;
exports.sleep = sleep;
exports.createErrorLog = createErrorLog;
exports.determineNextStateOnError = determineNextStateOnError;
const types_1 = require("../types");
exports.DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    initialDelayMs: 2000,
    maxDelayMs: 16000,
    backoffMultiplier: 2,
    timeoutMs: 30000
};
async function executeWithRetry(operation, config = exports.DEFAULT_RETRY_CONFIG, component = "unknown") {
    let lastError = null;
    let delay = config.initialDelayMs;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timeout after ${config.timeoutMs}ms`)), config.timeoutMs));
            return await Promise.race([operation(), timeoutPromise]);
        }
        catch (error) {
            lastError = error;
            // Check if error is retryable
            if (error instanceof types_1.EscalationError) {
                throw error;
            }
            if (attempt < config.maxRetries) {
                console.warn(`[${component}] Attempt ${attempt + 1} failed: ${lastError.message}. ` +
                    `Retrying in ${delay}ms...`);
                await sleep(delay);
                delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
            }
        }
    }
    throw new types_1.RetryableError("MAX_RETRIES_EXCEEDED", component, `Failed after ${config.maxRetries} retries: ${lastError?.message}`);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function createErrorLog(error, component, incident_id, context) {
    const isProcessingError = error instanceof types_1.IncidentProcessingError;
    return {
        timestamp: new Date().toISOString(),
        component,
        incident_id,
        error_name: error.name,
        error_message: error.message,
        error_code: isProcessingError ? error.code : "UNKNOWN",
        escalation_required: isProcessingError
            ? error.escalation_required
            : false,
        context: context || {},
        stack: error.stack
    };
}
function determineNextStateOnError(error, currentState) {
    if (error instanceof types_1.EscalationError) {
        return types_1.IncidentState.ESCALATED;
    }
    if (error instanceof types_1.RetryableError) {
        // Remain in current state for transient errors
        return currentState;
    }
    // For unknown errors, escalate
    return types_1.IncidentState.ESCALATED;
}
//# sourceMappingURL=errors.js.map