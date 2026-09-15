/**
 * Diagnosis Component (RECEIVED → TRIAGED)
 * Analyzes error payloads and evidence to form root cause hypothesis
 */

import {
  Incident,
  Diagnosis,
  ErrorSignature,
  Severity,
  Confidence,
  AffectedField,
  RemediationSuggestion,
  EscalationError
} from "../types";
import { createErrorLog } from "../utils/errors";

export class DiagnosisEngine {
  async process(incident: Incident): Promise<Diagnosis> {
    const startTime = Date.now();

    try {
      // Step 1: Parse raw error payload
      const error = incident.raw_error_payload;
      const errorSignature = this.classifyErrorSignature(error.error_message);

      // Step 2: Inspect per-module I/O
      const affectedModuleIO = incident.per_module_io[error.cause_module_id];

      if (!affectedModuleIO) {
        throw new EscalationError(
          "MISSING_MODULE_IO",
          "diagnosis",
          `Error payload references module ${error.cause_module_id} without execution trace`
        );
      }

      // Step 3: Analyze parameter mismatches
      const parameterIssues = this.analyzeParameterMismatches(
        affectedModuleIO,
        error.cause_module_id
      );

      // Step 4: Inspect component state
      const componentLimits = this.getComponentLimits(
        incident.blueprint_hash,
        error.cause_module_id
      );

      // Step 5: Form root cause hypothesis
      const rootCause = this.determineRootCause(
        errorSignature,
        parameterIssues,
        error.error_message,
        componentLimits
      );

      // Step 6: Classify severity and confidence
      const severity = this.classifySeverity(rootCause, parameterIssues);
      const confidence = this.classifyConfidence({
        per_module_io_available: !!affectedModuleIO,
        parameter_mismatch_detected: parameterIssues.length > 0,
        error_reproducible: true
      });

      // Step 7: Compile remediation suggestions
      const remediationSuggestions = this.generateRemediationSuggestions(
        rootCause,
        parameterIssues,
        error
      );

      // Step 8: Build diagnosis output
      const diagnosis: Diagnosis = {
        incident_id: incident.incident_id,
        diagnosed_timestamp: new Date().toISOString(),
        diagnosis_text: this.generateDiagnosisText(
          rootCause,
          parameterIssues,
          error,
          componentLimits
        ),
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

      console.log(
        `[DIAGNOSIS] Processed incident ${incident.incident_id} in ${Date.now() - startTime}ms. ` +
        `Root cause: ${rootCause.category}, Severity: ${severity}, Confidence: ${confidence}`
      );

      return diagnosis;
    } catch (error) {
      const err = error as Error;
      console.error(
        `[DIAGNOSIS] Error processing incident ${incident.incident_id}:`,
        createErrorLog(err, "diagnosis", incident.incident_id)
      );
      throw error;
    }
  }

  private classifyErrorSignature(errorMessage: string): ErrorSignature {
    const msg = errorMessage.toLowerCase();

    if (msg.includes("max_tokens") || msg.includes("truncat")) {
      return ErrorSignature.OUTPUT_EXHAUSTION;
    }
    if (msg.includes("bundle") || msg.includes("validation")) {
      return ErrorSignature.OPERATOR_ERROR;
    }
    if (msg.includes("422") || msg.includes("type mismatch")) {
      return ErrorSignature.DOWNSTREAM_WRITE_REJECTION;
    }
    if (msg.includes("safety") || msg.includes("filter")) {
      return ErrorSignature.LLM_SAFETY_FILTER;
    }
    if (msg.includes("429") || msg.includes("rate")) {
      return ErrorSignature.DOWNSTREAM_RATE_LIMIT;
    }
    if (msg.includes("401") || msg.includes("403") || msg.includes("auth")) {
      return ErrorSignature.DOWNSTREAM_AUTH_FAILURE;
    }
    if (msg.includes("syntax")) {
      return ErrorSignature.MAPPER_SYNTAX_ERROR;
    }
    if (msg.includes("reference") || msg.includes("null")) {
      return ErrorSignature.NULL_REFERENCE;
    }
    if (msg.includes("type")) {
      return ErrorSignature.TYPE_ERROR_TRANSFORM;
    }

    return ErrorSignature.UNKNOWN_ERROR;
  }

  private analyzeParameterMismatches(
    moduleIO: any,
    moduleId: string
  ): Array<{ param_name: string; value: any; expected_type: string; actual_type: string }> {
    const issues: any[] = [];

    if (!moduleIO.inputs) {
      return issues;
    }

    // Mock schema for now - in production, would query actual component schemas
    const schemaMap: Record<string, Record<string, string>> = {
      "3": { top_p: "number", max_tokens: "number", model: "string", temperature: "number" },
      "5": { fields: "object", record_id: "string" }
    };

    const schema = schemaMap[moduleId] || {};

    for (const [paramName, paramValue] of Object.entries(moduleIO.inputs)) {
      const expectedType = schema[paramName];
      if (!expectedType) continue;

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

  private getComponentLimits(
    _blueprintHash: string,
    moduleId: string
  ): Record<string, any> {
    // Mock component limits - in production, would query actual component specifications
    const limits: Record<string, Record<string, any>> = {
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

  private determineRootCause(
    errorSignature: ErrorSignature,
    parameterIssues: any[],
    errorMessage: string,
    _componentLimits: Record<string, any>
  ): { category: ErrorSignature; confidence: number } {
    // If we have parameter type mismatches, it's likely operator error
    if (parameterIssues.length > 0) {
      return { category: ErrorSignature.OPERATOR_ERROR, confidence: 0.95 };
    }

    // If error mentions truncation or MAX_TOKENS, it's output exhaustion
    if (
      errorSignature === ErrorSignature.OUTPUT_EXHAUSTION ||
      errorMessage.includes("MAX_TOKENS") ||
      errorMessage.includes("truncat")
    ) {
      return { category: ErrorSignature.OUTPUT_EXHAUSTION, confidence: 0.9 };
    }

    // If 422 or type mismatch, downstream write rejection
    if (errorMessage.includes("422") || errorMessage.includes("type mismatch")) {
      return { category: ErrorSignature.DOWNSTREAM_WRITE_REJECTION, confidence: 0.85 };
    }

    // Default to the signature we classified
    return { category: errorSignature, confidence: 0.7 };
  }

  private classifySeverity(
    rootCause: { category: ErrorSignature; confidence: number },
    parameterIssues: any[]
  ): Severity {
    // Critical: Missing evidence or unknown error
    if (rootCause.category === ErrorSignature.UNKNOWN_ERROR) {
      return Severity.CRITICAL;
    }

    // High: Parameter type errors (operator error)
    if (rootCause.category === ErrorSignature.OPERATOR_ERROR && parameterIssues.length > 0) {
      return Severity.HIGH;
    }

    // High: Auth or rate limit failures
    if (
      rootCause.category === ErrorSignature.DOWNSTREAM_AUTH_FAILURE ||
      rootCause.category === ErrorSignature.DOWNSTREAM_RATE_LIMIT
    ) {
      return Severity.HIGH;
    }

    // Medium: Output exhaustion, downstream write rejection
    if (
      rootCause.category === ErrorSignature.OUTPUT_EXHAUSTION ||
      rootCause.category === ErrorSignature.DOWNSTREAM_WRITE_REJECTION
    ) {
      return Severity.MEDIUM;
    }

    // Low: LLM safety filters, mapper errors
    return Severity.LOW;
  }

  private classifyConfidence(evidence: {
    per_module_io_available: boolean;
    parameter_mismatch_detected: boolean;
    error_reproducible: boolean;
  }): Confidence {
    const evidenceScore = Object.values(evidence).filter(Boolean).length;

    if (evidenceScore === 3) {
      return Confidence.HIGH;
    } else if (evidenceScore === 2) {
      return Confidence.MEDIUM;
    } else {
      return Confidence.LOW;
    }
  }

  private generateRemediationSuggestions(
    rootCause: { category: ErrorSignature; confidence: number },
    parameterIssues: any[],
    _error: any
  ): RemediationSuggestion[] {
    const suggestions: RemediationSuggestion[] = [];

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
    if (rootCause.category === ErrorSignature.OUTPUT_EXHAUSTION) {
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
    if (rootCause.category === ErrorSignature.DOWNSTREAM_WRITE_REJECTION) {
      suggestions.push({
        priority: "HIGH",
        action: "Validate schema conformance",
        description: "Ensure all fields match target system schema before writing",
        expected_outcome: "Data will be accepted by downstream system"
      });
    }

    return suggestions;
  }

  private extractAffectedFields(
    parameterIssues: any[],
    _rootCause: { category: ErrorSignature; confidence: number }
  ): AffectedField[] {
    return parameterIssues.map(issue => ({
      module_path: `module_${issue.module_id || "unknown"}.inputs.${issue.param_name}`,
      current_type: issue.actual_type,
      expected_type: issue.expected_type,
      current_value: issue.value
    }));
  }

  private generateDiagnosisText(
    rootCause: { category: ErrorSignature; confidence: number },
    parameterIssues: any[],
    error: any,
    componentLimits: Record<string, any>
  ): string {
    let text = `Root cause: ${rootCause.category} (confidence: ${(rootCause.confidence * 100).toFixed(0)}%).\n`;

    if (parameterIssues.length > 0) {
      text += `Parameter type mismatches detected: ${parameterIssues.map(i => `${i.param_name}: ${i.actual_type} (expected ${i.expected_type})`).join(", ")}.\n`;
    }

    if (rootCause.category === ErrorSignature.OUTPUT_EXHAUSTION) {
      const maxTokens = componentLimits.max_tokens || 1000;
      text += `Output would exceed token limit (${maxTokens}), causing truncation. `;
      text += `Downstream modules receive incomplete or malformed data.\n`;
    }

    if (rootCause.category === ErrorSignature.DOWNSTREAM_WRITE_REJECTION) {
      text += `Downstream system rejected write operation: ${error.error_message}. `;
      text += `Likely schema mismatch or type validation failure.\n`;
    }

    text += `Error: ${error.error_message}`;

    return text.trim();
  }
}
