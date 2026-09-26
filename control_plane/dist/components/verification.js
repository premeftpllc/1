"use strict";
/**
 * Verification Component (EXECUTING → VERIFYING)
 * Performs dual checks: success (was root cause resolved?) and regression (new errors introduced?)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationEngine = void 0;
const types_1 = require("../types");
const errors_1 = require("../utils/errors");
class VerificationEngine {
    async process(incident, _executionId, executionOutcome) {
        const startTime = Date.now();
        try {
            if (!incident.diagnosis) {
                throw new types_1.EscalationError("MISSING_DIAGNOSIS", "verification", "Incident does not have diagnosis");
            }
            if (!incident.repair_proposal) {
                throw new types_1.EscalationError("MISSING_REPAIR_PROPOSAL", "verification", "Incident does not have repair proposal");
            }
            const diagnosis = incident.diagnosis;
            const verificationChecks = [];
            // Step 1: Perform success check
            const successCheck = this.performSuccessCheck(diagnosis, executionOutcome);
            verificationChecks.push(successCheck);
            // Step 2: Perform regression check
            const regressionCheck = this.performRegressionCheck(incident, executionOutcome);
            verificationChecks.push(regressionCheck);
            // Step 3: Determine overall result
            const allChecksPassed = verificationChecks.every(check => check.result === types_1.VerificationResult.PASS);
            const verificationResult = allChecksPassed ? types_1.VerificationResult.PASS : types_1.VerificationResult.FAIL;
            const nextState = allChecksPassed ? types_1.IncidentState.RECONCILING : types_1.IncidentState.BLOCKED;
            const output = {
                incident_id: incident.incident_id,
                verification_timestamp: new Date().toISOString(),
                verification_result: verificationResult,
                verification_checks_performed: verificationChecks,
                inspection_timestamp: executionOutcome.completion_timestamp || new Date().toISOString(),
                regression_detected: regressionCheck.result === types_1.VerificationResult.FAIL,
                next_state: nextState,
                failure_reason: verificationResult === types_1.VerificationResult.FAIL
                    ? this.generateFailureReason(verificationChecks)
                    : undefined
            };
            console.log(`[VERIFICATION] Verified incident ${incident.incident_id} in ${Date.now() - startTime}ms. ` +
                `Result: ${verificationResult}, Regression: ${output.regression_detected}`);
            return output;
        }
        catch (error) {
            const err = error;
            console.error(`[VERIFICATION] Error processing incident ${incident.incident_id}:`, (0, errors_1.createErrorLog)(err, "verification", incident.incident_id));
            throw error;
        }
    }
    performSuccessCheck(diagnosis, executionOutcome) {
        const check = {
            check_name: "root_cause_resolved",
            result: types_1.VerificationResult.FAIL,
            evidence: {}
        };
        if (!executionOutcome.per_module_io) {
            check.evidence = { error: "No per_module_io in execution outcome" };
            return check;
        }
        const rootCauseCategory = diagnosis.root_cause_category;
        switch (rootCauseCategory) {
            case types_1.ErrorSignature.OPERATOR_ERROR: {
                // Check if parameter types were corrected
                if (diagnosis.affected_fields.length === 0) {
                    check.result = types_1.VerificationResult.PASS;
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
                const paramValue = moduleIO.inputs[paramName];
                const actualType = typeof paramValue;
                const typeMatches = actualType === field.expected_type;
                check.result = typeMatches ? types_1.VerificationResult.PASS : types_1.VerificationResult.FAIL;
                check.evidence = {
                    parameter: field.module_path,
                    value_after_repair: paramValue,
                    type_after_repair: actualType,
                    type_matches_expected: typeMatches
                };
                break;
            }
            case types_1.ErrorSignature.OUTPUT_EXHAUSTION: {
                // Check if output was not truncated
                if (diagnosis.affected_fields.length === 0) {
                    check.result = types_1.VerificationResult.PASS;
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
                check.result = !isTruncated ? types_1.VerificationResult.PASS : types_1.VerificationResult.FAIL;
                check.evidence = {
                    output_length: output.length,
                    truncation_detected: isTruncated
                };
                break;
            }
            case types_1.ErrorSignature.DOWNSTREAM_WRITE_REJECTION: {
                // Check if downstream module now accepts data
                const downstreamModuleId = this.findDownstreamModule(executionOutcome.per_module_io, this.extractModuleId(diagnosis.affected_fields[0]?.module_path));
                if (!downstreamModuleId) {
                    check.evidence = { error: "Downstream module not found" };
                    break;
                }
                const downstreamIO = executionOutcome.per_module_io[downstreamModuleId];
                const success = downstreamIO?.outputs && !downstreamIO.outputs.error;
                check.result = success ? types_1.VerificationResult.PASS : types_1.VerificationResult.FAIL;
                check.evidence = {
                    downstream_module_status: downstreamIO?.outputs?.status || "UNKNOWN",
                    errors: downstreamIO?.outputs?.error
                };
                break;
            }
            default: {
                // For other error types, check if execution was successful
                const hasErrors = this.detectExecutionErrors(executionOutcome);
                check.result = !hasErrors ? types_1.VerificationResult.PASS : types_1.VerificationResult.FAIL;
                check.evidence = { execution_has_errors: hasErrors };
            }
        }
        return check;
    }
    performRegressionCheck(incident, executionOutcome) {
        const check = {
            check_name: "no_regressions",
            result: types_1.VerificationResult.PASS,
            evidence: {}
        };
        if (!executionOutcome.per_module_io) {
            check.evidence = { error: "No per_module_io for regression check" };
            check.result = types_1.VerificationResult.FAIL;
            return check;
        }
        const dlqCountBefore = this.countDLQRecords(incident.per_module_io) || 0;
        const dlqCountAfter = executionOutcome.dlqCount || this.countDLQRecords(executionOutcome.per_module_io) || 0;
        const errorCountBefore = this.countErrors(incident.per_module_io) || 0;
        const errorCountAfter = this.countErrors(executionOutcome.per_module_io) || 0;
        const hasRegression = dlqCountAfter > dlqCountBefore || errorCountAfter > errorCountBefore;
        check.result = !hasRegression ? types_1.VerificationResult.PASS : types_1.VerificationResult.FAIL;
        check.evidence = {
            dlq_count_before: dlqCountBefore,
            dlq_count_after: dlqCountAfter,
            error_count_before: errorCountBefore,
            error_count_after: errorCountAfter,
            new_errors_detected: hasRegression
        };
        return check;
    }
    extractModuleId(modulePath) {
        const match = modulePath.match(/module_(\d+|[a-zA-Z0-9_]+)/);
        return match ? match[1] : "";
    }
    detectTruncation(output) {
        // Simple heuristic: if output ends with incomplete JSON or looks cut off
        return (output.endsWith("[...") ||
            output.endsWith("{...") ||
            output.endsWith("...") ||
            (output.endsWith("]") && output.includes('...')) ||
            (output.endsWith("}") && output.includes('...')));
    }
    detectExecutionErrors(executionOutcome) {
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
    findDownstreamModule(perModuleIO, moduleId) {
        const moduleIds = Object.keys(perModuleIO).map(id => parseInt(id, 10) || id);
        const currentModuleNum = parseInt(moduleId, 10) || moduleId;
        const downstreamModuleNum = typeof currentModuleNum === "number"
            ? moduleIds.find((id) => id > currentModuleNum)
            : null;
        return downstreamModuleNum ? String(downstreamModuleNum) : null;
    }
    countDLQRecords(perModuleIO) {
        let count = 0;
        for (const moduleIO of Object.values(perModuleIO)) {
            if (moduleIO.outputs && moduleIO.outputs.dlqCount) {
                count += moduleIO.outputs.dlqCount;
            }
        }
        return count;
    }
    countErrors(perModuleIO) {
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
    generateFailureReason(checks) {
        const failedChecks = checks.filter(c => c.result === types_1.VerificationResult.FAIL);
        return failedChecks
            .map(c => `${c.check_name}: ${JSON.stringify(c.evidence).substring(0, 50)}`)
            .join("; ");
    }
}
exports.VerificationEngine = VerificationEngine;
//# sourceMappingURL=verification.js.map