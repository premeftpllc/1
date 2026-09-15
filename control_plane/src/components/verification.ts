/**
 * Verification Component (EXECUTING → VERIFYING)
 * Performs dual checks: success (was root cause resolved?) and regression (new errors introduced?)
 */

import {
  Incident,
  Diagnosis,
  VerificationOutput,
  VerificationCheck,
  VerificationResult,
  ErrorSignature,
  IncidentState,
  EscalationError,
  MakeExecutionResponse
} from "../types";
import { createErrorLog } from "../utils/errors";

export class VerificationEngine {
  async process(
    incident: Incident,
    _executionId: string,
    executionOutcome: MakeExecutionResponse
  ): Promise<VerificationOutput> {
    const startTime = Date.now();

    try {
      if (!incident.diagnosis) {
        throw new EscalationError(
          "MISSING_DIAGNOSIS",
          "verification",
          "Incident does not have diagnosis"
        );
      }

      if (!incident.repair_proposal) {
        throw new EscalationError(
          "MISSING_REPAIR_PROPOSAL",
          "verification",
          "Incident does not have repair proposal"
        );
      }

      const diagnosis = incident.diagnosis;
      const verificationChecks: VerificationCheck[] = [];

      // Step 1: Perform success check
      const successCheck = this.performSuccessCheck(
        diagnosis,
        executionOutcome
      );
      verificationChecks.push(successCheck);

      // Step 2: Perform regression check
      const regressionCheck = this.performRegressionCheck(
        incident,
        executionOutcome
      );
      verificationChecks.push(regressionCheck);

      // Step 3: Determine overall result
      const allChecksPassed = verificationChecks.every(
        check => check.result === VerificationResult.PASS
      );
      const verificationResult = allChecksPassed ? VerificationResult.PASS : VerificationResult.FAIL;
      const nextState = allChecksPassed ? IncidentState.RECONCILING : IncidentState.BLOCKED;

      const output: VerificationOutput = {
        incident_id: incident.incident_id,
        verification_timestamp: new Date().toISOString(),
        verification_result: verificationResult,
        verification_checks_performed: verificationChecks,
        inspection_timestamp: executionOutcome.completion_timestamp || new Date().toISOString(),
        regression_detected: regressionCheck.result === VerificationResult.FAIL,
        next_state: nextState,
        failure_reason: verificationResult === VerificationResult.FAIL
          ? this.generateFailureReason(verificationChecks)
          : undefined
      };

      console.log(
        `[VERIFICATION] Verified incident ${incident.incident_id} in ${Date.now() - startTime}ms. ` +
        `Result: ${verificationResult}, Regression: ${output.regression_detected}`
      );

      return output;
    } catch (error) {
      const err = error as Error;
      console.error(
        `[VERIFICATION] Error processing incident ${incident.incident_id}:`,
        createErrorLog(err, "verification", incident.incident_id)
      );
      throw error;
    }
  }

  private performSuccessCheck(
    diagnosis: Diagnosis,
    executionOutcome: MakeExecutionResponse
  ): VerificationCheck {
    const check: VerificationCheck = {
      check_name: "root_cause_resolved",
      result: VerificationResult.FAIL,
      evidence: {}
    };

    if (!executionOutcome.per_module_io) {
      check.evidence = { error: "No per_module_io in execution outcome" };
      return check;
    }

    const rootCauseCategory = diagnosis.root_cause_category;

    switch (rootCauseCategory) {
      case ErrorSignature.OPERATOR_ERROR: {
        // Check if parameter types were corrected
        if (diagnosis.affected_fields.length === 0) {
          check.result = VerificationResult.PASS;
          check.evidence = { info: "No affected fields to verify" };
          break;
        }

        const field = diagnosis.affected_fields[0];
        const moduleId = this.extractModuleId(field.module_path);
        const moduleIO = executionOutcome.per_module_io[moduleId];

        if (!moduleIO || !moduleIO.inputs) {
          check.evidence = { error: `Module ${moduleId} not found in execution outcome` };
          break;
        }

        const paramName = field.module_path.split(".").pop();
        const paramValue = moduleIO.inputs[paramName!];
        const actualType = typeof paramValue;

        const typeMatches = actualType === field.expected_type;
        check.result = typeMatches ? VerificationResult.PASS : VerificationResult.FAIL;
        check.evidence = {
          parameter: field.module_path,
          value_after_repair: paramValue,
          type_after_repair: actualType,
          type_matches_expected: typeMatches
        };
        break;
      }

      case ErrorSignature.OUTPUT_EXHAUSTION: {
        // Check if output was not truncated
        if (diagnosis.affected_fields.length === 0) {
          check.result = VerificationResult.PASS;
          check.evidence = { info: "No output limits to verify" };
          break;
        }

        const field = diagnosis.affected_fields[0];
        const moduleId = this.extractModuleId(field.module_path);
        const moduleIO = executionOutcome.per_module_io[moduleId];

        if (!moduleIO || !moduleIO.outputs) {
          check.evidence = { error: `Module ${moduleId} outputs not found` };
          break;
        }

        const output = JSON.stringify(moduleIO.outputs);
        const isTruncated = this.detectTruncation(output);

        check.result = !isTruncated ? VerificationResult.PASS : VerificationResult.FAIL;
        check.evidence = {
          output_length: output.length,
          truncation_detected: isTruncated
        };
        break;
      }

      case ErrorSignature.DOWNSTREAM_WRITE_REJECTION: {
        // Check if downstream module now accepts data
        const downstreamModuleId = this.findDownstreamModule(
          executionOutcome.per_module_io,
          this.extractModuleId(diagnosis.affected_fields[0]?.module_path)
        );

        if (!downstreamModuleId) {
          check.evidence = { error: "Downstream module not found" };
          break;
        }

        const downstreamIO = executionOutcome.per_module_io[downstreamModuleId];
        const success = downstreamIO?.outputs && !downstreamIO.outputs.error;

        check.result = success ? VerificationResult.PASS : VerificationResult.FAIL;
        check.evidence = {
          downstream_module_status: downstreamIO?.outputs?.status || "UNKNOWN",
          errors: downstreamIO?.outputs?.error
        };
        break;
      }

      default: {
        // For other error types, check if execution was successful
        const hasErrors = this.detectExecutionErrors(executionOutcome);
        check.result = !hasErrors ? VerificationResult.PASS : VerificationResult.FAIL;
        check.evidence = { execution_has_errors: hasErrors };
      }
    }

    return check;
  }

  private performRegressionCheck(
    incident: Incident,
    executionOutcome: MakeExecutionResponse
  ): VerificationCheck {
    const check: VerificationCheck = {
      check_name: "no_regressions",
      result: VerificationResult.PASS,
      evidence: {}
    };

    if (!executionOutcome.per_module_io) {
      check.evidence = { error: "No per_module_io for regression check" };
      check.result = VerificationResult.FAIL;
      return check;
    }

    const dlqCountBefore = this.countDLQRecords(incident.per_module_io) || 0;
    const dlqCountAfter = executionOutcome.dlqCount || this.countDLQRecords(executionOutcome.per_module_io) || 0;

    const errorCountBefore = this.countErrors(incident.per_module_io) || 0;
    const errorCountAfter = this.countErrors(executionOutcome.per_module_io) || 0;

    const hasRegression = dlqCountAfter > dlqCountBefore || errorCountAfter > errorCountBefore;

    check.result = !hasRegression ? VerificationResult.PASS : VerificationResult.FAIL;
    check.evidence = {
      dlq_count_before: dlqCountBefore,
      dlq_count_after: dlqCountAfter,
      error_count_before: errorCountBefore,
      error_count_after: errorCountAfter,
      new_errors_detected: hasRegression
    };

    return check;
  }

  private extractModuleId(modulePath: string): string {
    const match = modulePath.match(/module_(\d+|[a-zA-Z0-9_]+)/);
    return match ? match[1] : "";
  }

  private detectTruncation(output: string): boolean {
    // Simple heuristic: if output ends with incomplete JSON or looks cut off
    return (
      output.endsWith("[...") ||
      output.endsWith("{...") ||
      output.endsWith("...") ||
      (output.endsWith("]") && output.includes('...')) ||
      (output.endsWith("}") && output.includes('...'))
    );
  }

  private detectExecutionErrors(executionOutcome: MakeExecutionResponse): boolean {
    if (!executionOutcome.per_module_io) {
      return false;
    }

    for (const moduleIO of Object.values(executionOutcome.per_module_io)) {
      if (moduleIO.outputs && moduleIO.outputs.error) {
        return true;
      }
      if (moduleIO.outputs && moduleIO.outputs.status === "ERROR") {
        return true;
      }
    }

    return false;
  }

  private findDownstreamModule(perModuleIO: Record<string, any>, moduleId: string): string | null {
    const moduleIds = Object.keys(perModuleIO).map(id =>
      parseInt(id, 10) || id
    );

    const currentModuleNum = parseInt(moduleId, 10) || moduleId;
    const downstreamModuleNum =
      typeof currentModuleNum === "number"
        ? moduleIds.find((id: any) => id > currentModuleNum)
        : null;

    return downstreamModuleNum ? String(downstreamModuleNum) : null;
  }

  private countDLQRecords(perModuleIO: Record<string, any>): number {
    let count = 0;
    for (const moduleIO of Object.values(perModuleIO)) {
      if (moduleIO.outputs && moduleIO.outputs.dlqCount) {
        count += moduleIO.outputs.dlqCount;
      }
    }
    return count;
  }

  private countErrors(perModuleIO: Record<string, any>): number {
    let count = 0;
    for (const moduleIO of Object.values(perModuleIO)) {
      if (moduleIO.outputs && moduleIO.outputs.status === "ERROR") {
        count++;
      }
      if (moduleIO.outputs && moduleIO.outputs.error) {
        count++;
      }
    }
    return count;
  }

  private generateFailureReason(checks: VerificationCheck[]): string {
    const failedChecks = checks.filter(c => c.result === VerificationResult.FAIL);
    return failedChecks
      .map(c => `${c.check_name}: ${JSON.stringify(c.evidence).substring(0, 50)}`)
      .join("; ");
  }
}
