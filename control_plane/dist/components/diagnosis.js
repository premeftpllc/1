"use strict";
/**
 * Diagnosis Component (RECEIVED → TRIAGED)
 * Analyzes error payloads and evidence to form root cause hypothesis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosisEngine = void 0;
const types_1 = require("../types");
const errors_1 = require("../utils/errors");
class DiagnosisEngine {
    async process(incident) {
        const startTime = Date.now();
        try {
            // Step 1: Parse raw error payload
            const error = incident.raw_error_payload;
            const errorSignature = this.classifyErrorSignature(error.error_message);
            // Step 2: Inspect per-module I/O
            const affectedModuleIO = incident.per_module_io[error.cause_module_id];
            if (!affectedModuleIO) {
                throw new types_1.EscalationError("MISSING_MODULE_IO", "diagnosis", `Error payload references module ${error.cause_module_id} without execution trace`);
            }
            // Step 3: Analyze parameter mismatches
            const parameterIssues = this.analyzeParameterMismatches(affectedModuleIO, error.cause_module_id);
            // Step 4: Inspect component state
            const componentLimits = this.getComponentLimits(incident.blueprint_hash, error.cause_module_id);
            // Step 5: Form root cause hypothesis
            const rootCause = this.determineRootCause(errorSignature, parameterIssues, error.error_message, componentLimits);
            // Step 6: Classify severity and confidence
            const severity = this.classifySeverity(rootCause, parameterIssues);
            const confidence = this.classifyConfidence({
                per_module_io_available: !!affectedModuleIO,
                parameter_mismatch_detected: parameterIssues.length > 0,
                error_reproducible: true
            });
            // Step 7: Compile remediation suggestions
            const remediationSuggestions = this.generateRemediationSuggestions(rootCause, parameterIssues, error);
            // Step 8: Build diagnosis output
            const diagnosis = {
                incident_id: incident.incident_id,
                diagnosed_timestamp: new Date().toISOString(),
                diagnosis_text: this.generateDiagnosisText(rootCause, parameterIssues, error, componentLimits),
                root_cause_category: rootCause.category,
                severity,
                confidence,
                affected_fields: this.extractAffectedFields(parameterIssues, rootCause),
                remediation_suggestions: remediationSuggestions,
                error_signature: errorSignature,
                evidence_sources: {
                    raw_error_payload: true,
                    per_module_io: true,
                    blueprint_configuration: true
                }
            };
            console.log(`[DIAGNOSIS] Processed incident ${incident.incident_id} in ${Date.now() - startTime}ms. ` +
                `Root cause: ${rootCause.category}, Severity: ${severity}, Confidence: ${confidence}`);
            return diagnosis;
        }
        catch (error) {
            const err = error;
            console.error(`[DIAGNOSIS] Error processing incident ${incident.incident_id}:`, (0, errors_1.createErrorLog)(err, "diagnosis", incident.incident_id));
            throw error;
        }
    }
    classifyErrorSignature(errorMessage) {
        const msg = errorMessage.toLowerCase();
        if (msg.includes("max_tokens") || msg.includes("truncat")) {
            return types_1.ErrorSignature.OUTPUT_EXHAUSTION;
        }
        if (msg.includes("bundle") || msg.includes("validation")) {
            return types_1.ErrorSignature.OPERATOR_ERROR;
        }
        if (msg.includes("422") || msg.includes("type mismatch")) {
            return types_1.ErrorSignature.DOWNSTREAM_WRITE_REJECTION;
        }
        if (msg.includes("safety") || msg.includes("filter")) {
            return types_1.ErrorSignature.LLM_SAFETY_FILTER;
        }
        if (msg.includes("429") || msg.includes("rate")) {
            return types_1.ErrorSignature.DOWNSTREAM_RATE_LIMIT;
        }
        if (msg.includes("401") || msg.includes("403") || msg.includes("auth")) {
            return types_1.ErrorSignature.DOWNSTREAM_AUTH_FAILURE;
        }
        if (msg.includes("syntax")) {
            return types_1.ErrorSignature.MAPPER_SYNTAX_ERROR;
        }
        if (msg.includes("reference") || msg.includes("null")) {
            return types_1.ErrorSignature.NULL_REFERENCE;
        }
        if (msg.includes("type")) {
            return types_1.ErrorSignature.TYPE_ERROR_TRANSFORM;
        }
        return types_1.ErrorSignature.UNKNOWN_ERROR;
    }
    analyzeParameterMismatches(moduleIO, moduleId) {
        const issues = [];
        if (!moduleIO.inputs) {
            return issues;
        }
        // Mock schema for now - in production, would query actual component schemas
        const schemaMap = {
            "3": { top_p: "number", max_tokens: "number", model: "string", temperature: "number" },
            "5": { fields: "object", record_id: "string" }
        };
        const schema = schemaMap[moduleId] || {};
        for (const [paramName, paramValue] of Object.entries(moduleIO.inputs)) {
            const expectedType = schema[paramName];
            if (!expectedType)
                continue;
            const actualType = typeof paramValue === "object" ? "object" : typeof paramValue;
            if (actualType !== expectedType && expectedType !== "object") {
                issues.push({
                    param_name: paramName,
                    value: paramValue,
                    expected_type: expectedType,
                    actual_type: actualType
                });
            }
        }
        return issues;
    }
    getComponentLimits(_blueprintHash, moduleId) {
        // Mock component limits - in production, would query actual component specifications
        const limits = {
            "3": {
                max_tokens: 1000,
                max_output_length: 10000,
                timeout_seconds: 30
            },
            "5": {
                max_records_per_call: 100,
                timeout_seconds: 30
            }
        };
        return limits[moduleId] || {};
    }
    determineRootCause(errorSignature, parameterIssues, errorMessage, _componentLimits) {
        // If we have parameter type mismatches, it's likely operator error
        if (parameterIssues.length > 0) {
            return { category: types_1.ErrorSignature.OPERATOR_ERROR, confidence: 0.95 };
        }
        // If error mentions truncation or MAX_TOKENS, it's output exhaustion
        if (errorSignature === types_1.ErrorSignature.OUTPUT_EXHAUSTION ||
            errorMessage.includes("MAX_TOKENS") ||
            errorMessage.includes("truncat")) {
            return { category: types_1.ErrorSignature.OUTPUT_EXHAUSTION, confidence: 0.9 };
        }
        // If 422 or type mismatch, downstream write rejection
        if (errorMessage.includes("422") || errorMessage.includes("type mismatch")) {
            return { category: types_1.ErrorSignature.DOWNSTREAM_WRITE_REJECTION, confidence: 0.85 };
        }
        // Default to the signature we classified
        return { category: errorSignature, confidence: 0.7 };
    }
    classifySeverity(rootCause, parameterIssues) {
        // Critical: Missing evidence or unknown error
        if (rootCause.category === types_1.ErrorSignature.UNKNOWN_ERROR) {
            return types_1.Severity.CRITICAL;
        }
        // High: Parameter type errors (operator error)
        if (rootCause.category === types_1.ErrorSignature.OPERATOR_ERROR && parameterIssues.length > 0) {
            return types_1.Severity.HIGH;
        }
        // High: Auth or rate limit failures
        if (rootCause.category === types_1.ErrorSignature.DOWNSTREAM_AUTH_FAILURE ||
            rootCause.category === types_1.ErrorSignature.DOWNSTREAM_RATE_LIMIT) {
            return types_1.Severity.HIGH;
        }
        // Medium: Output exhaustion, downstream write rejection
        if (rootCause.category === types_1.ErrorSignature.OUTPUT_EXHAUSTION ||
            rootCause.category === types_1.ErrorSignature.DOWNSTREAM_WRITE_REJECTION) {
            return types_1.Severity.MEDIUM;
        }
        // Low: LLM safety filters, mapper errors
        return types_1.Severity.LOW;
    }
    classifyConfidence(evidence) {
        const evidenceScore = Object.values(evidence).filter(Boolean).length;
        if (evidenceScore === 3) {
            return types_1.Confidence.HIGH;
        }
        else if (evidenceScore === 2) {
            return types_1.Confidence.MEDIUM;
        }
        else {
            return types_1.Confidence.LOW;
        }
    }
    generateRemediationSuggestions(rootCause, parameterIssues, _error) {
        const suggestions = [];
        // Parameter type fixes
        if (parameterIssues.length > 0) {
            suggestions.push({
                priority: "HIGH",
                action: "Convert parameter types to match API spec",
                description: `Fix type mismatches: ${parameterIssues.map(i => `${i.param_name} (${i.actual_type} → ${i.expected_type})`).join(", ")}`,
                expected_outcome: "API will accept parameters with correct types"
            });
        }
        // Output exhaustion fixes
        if (rootCause.category === types_1.ErrorSignature.OUTPUT_EXHAUSTION) {
            suggestions.push({
                priority: "HIGH",
                action: "Increase output token limit",
                description: "Increase max_tokens to allow larger outputs without truncation",
                expected_outcome: "Output will not be truncated; downstream modules receive complete data"
            });
            suggestions.push({
                priority: "MEDIUM",
                action: "Add fallback summarization",
                description: "Implement overflow handling to summarize content if limit reached",
                expected_outcome: "Graceful degradation instead of complete failure"
            });
        }
        // Downstream write rejection fixes
        if (rootCause.category === types_1.ErrorSignature.DOWNSTREAM_WRITE_REJECTION) {
            suggestions.push({
                priority: "HIGH",
                action: "Validate schema conformance",
                description: "Ensure all fields match target system schema before writing",
                expected_outcome: "Data will be accepted by downstream system"
            });
        }
        return suggestions;
    }
    extractAffectedFields(parameterIssues, _rootCause) {
        return parameterIssues.map(issue => ({
            module_path: `module_${issue.module_id || "unknown"}.inputs.${issue.param_name}`,
            current_type: issue.actual_type,
            expected_type: issue.expected_type,
            current_value: issue.value
        }));
    }
    generateDiagnosisText(rootCause, parameterIssues, error, componentLimits) {
        let text = `Root cause: ${rootCause.category} (confidence: ${(rootCause.confidence * 100).toFixed(0)}%).\n`;
        if (parameterIssues.length > 0) {
            text += `Parameter type mismatches detected: ${parameterIssues.map(i => `${i.param_name}: ${i.actual_type} (expected ${i.expected_type})`).join(", ")}.\n`;
        }
        if (rootCause.category === types_1.ErrorSignature.OUTPUT_EXHAUSTION) {
            const maxTokens = componentLimits.max_tokens || 1000;
            text += `Output would exceed token limit (${maxTokens}), causing truncation. `;
            text += `Downstream modules receive incomplete or malformed data.\n`;
        }
        if (rootCause.category === types_1.ErrorSignature.DOWNSTREAM_WRITE_REJECTION) {
            text += `Downstream system rejected write operation: ${error.error_message}. `;
            text += `Likely schema mismatch or type validation failure.\n`;
        }
        text += `Error: ${error.error_message}`;
        return text.trim();
    }
}
exports.DiagnosisEngine = DiagnosisEngine;
//# sourceMappingURL=diagnosis.js.map