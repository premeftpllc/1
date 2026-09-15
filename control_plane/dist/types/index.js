"use strict";
/**
 * PremeOS Control Plane - Type Definitions
 * Shared types and interfaces across all 4 components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscalationError = exports.RetryableError = exports.IncidentProcessingError = exports.RiskLevel = exports.TerminalStatus = exports.VerificationResult = exports.AuthorizationLevel = exports.Confidence = exports.Severity = exports.ErrorSignature = exports.IncidentState = void 0;
// ============================================================================
// ENUMS
// ============================================================================
var IncidentState;
(function (IncidentState) {
    IncidentState["RECEIVED"] = "RECEIVED";
    IncidentState["TRIAGED"] = "TRIAGED";
    IncidentState["DIAGNOSING"] = "DIAGNOSING";
    IncidentState["AWAITING_APPROVAL"] = "AWAITING_APPROVAL";
    IncidentState["EXECUTING"] = "EXECUTING";
    IncidentState["VERIFYING"] = "VERIFYING";
    IncidentState["RECONCILING"] = "RECONCILING";
    IncidentState["CLOSED"] = "CLOSED";
    IncidentState["BLOCKED"] = "BLOCKED";
    IncidentState["ESCALATED"] = "ESCALATED";
})(IncidentState || (exports.IncidentState = IncidentState = {}));
var ErrorSignature;
(function (ErrorSignature) {
    ErrorSignature["OUTPUT_EXHAUSTION"] = "output_exhaustion";
    ErrorSignature["OPERATOR_ERROR"] = "operator_error";
    ErrorSignature["DOWNSTREAM_WRITE_REJECTION"] = "downstream_write_rejection";
    ErrorSignature["LLM_SAFETY_FILTER"] = "llm_safety_filter";
    ErrorSignature["LLM_GENERATION_FAILURE"] = "llm_generation_failure";
    ErrorSignature["DOWNSTREAM_RATE_LIMIT"] = "downstream_rate_limit";
    ErrorSignature["DOWNSTREAM_AUTH_FAILURE"] = "downstream_auth_failure";
    ErrorSignature["MAPPER_SYNTAX_ERROR"] = "mapper_syntax_error";
    ErrorSignature["NULL_REFERENCE"] = "null_reference";
    ErrorSignature["TYPE_ERROR_TRANSFORM"] = "type_error_transform";
    ErrorSignature["UNKNOWN_ERROR"] = "unknown_error";
})(ErrorSignature || (exports.ErrorSignature = ErrorSignature = {}));
var Severity;
(function (Severity) {
    Severity["CRITICAL"] = "CRITICAL";
    Severity["HIGH"] = "HIGH";
    Severity["MEDIUM"] = "MEDIUM";
    Severity["LOW"] = "LOW";
})(Severity || (exports.Severity = Severity = {}));
var Confidence;
(function (Confidence) {
    Confidence["HIGH"] = "HIGH";
    Confidence["MEDIUM"] = "MEDIUM";
    Confidence["LOW"] = "LOW";
})(Confidence || (exports.Confidence = Confidence = {}));
var AuthorizationLevel;
(function (AuthorizationLevel) {
    AuthorizationLevel["AUTOMATIC"] = "AUTOMATIC";
    AuthorizationLevel["OWNER_APPROVAL"] = "OWNER_APPROVAL";
    AuthorizationLevel["MANUAL_REVIEW"] = "MANUAL_REVIEW";
})(AuthorizationLevel || (exports.AuthorizationLevel = AuthorizationLevel = {}));
var VerificationResult;
(function (VerificationResult) {
    VerificationResult["PASS"] = "PASS";
    VerificationResult["FAIL"] = "FAIL";
})(VerificationResult || (exports.VerificationResult = VerificationResult = {}));
var TerminalStatus;
(function (TerminalStatus) {
    TerminalStatus["CLOSED_SUCCESS"] = "CLOSED_SUCCESS";
    TerminalStatus["BLOCKED_DUPLICATE"] = "BLOCKED_DUPLICATE";
    TerminalStatus["BLOCKED_MALFORMED_WRITE"] = "BLOCKED_MALFORMED_WRITE";
    TerminalStatus["BLOCKED_MALFORMED_AND_DUPLICATE"] = "BLOCKED_MALFORMED_AND_DUPLICATE";
})(TerminalStatus || (exports.TerminalStatus = TerminalStatus = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["CRITICAL"] = "CRITICAL";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["LOW"] = "LOW";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
// ============================================================================
// ERROR TYPES
// ============================================================================
class IncidentProcessingError extends Error {
    constructor(code, component, escalation_required = false, message) {
        super(message || code);
        this.code = code;
        this.component = component;
        this.escalation_required = escalation_required;
        this.name = "IncidentProcessingError";
    }
}
exports.IncidentProcessingError = IncidentProcessingError;
class RetryableError extends IncidentProcessingError {
    constructor(code, component, message) {
        super(code, component, false, message);
        this.name = "RetryableError";
    }
}
exports.RetryableError = RetryableError;
class EscalationError extends IncidentProcessingError {
    constructor(code, component, message) {
        super(code, component, true, message);
        this.name = "EscalationError";
    }
}
exports.EscalationError = EscalationError;
//# sourceMappingURL=index.js.map