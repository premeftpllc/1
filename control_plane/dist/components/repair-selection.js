"use strict";
/**
 * Repair Selection Component (TRIAGED → AWAITING_APPROVAL)
 * Matches diagnosis to repair playbooks and determines authorization level
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairSelectionEngine = void 0;
const types_1 = require("../types");
const errors_1 = require("../utils/errors");
class RepairSelectionEngine {
    constructor() {
        this.playbookDatabase = new Map();
        this.initializeDefaultPlaybooks();
    }
    async process(incident) {
        const startTime = Date.now();
        try {
            if (!incident.diagnosis) {
                throw new types_1.EscalationError("MISSING_DIAGNOSIS", "repair-selection", "Incident does not have diagnosis");
            }
            const diagnosis = incident.diagnosis;
            const rootCauseCategory = diagnosis.root_cause_category;
            // Step 1: Query Repair Playbook database
            const candidatePlaybooks = this.queryPlaybooks(rootCauseCategory);
            if (candidatePlaybooks.length === 0) {
                throw new types_1.EscalationError("NO_PLAYBOOK_FOUND", "repair-selection", `No playbook found for error_signature=${rootCauseCategory}`);
            }
            // Step 2: Rank playbooks by applicability
            const rankedPlaybooks = this.rankPlaybooks(candidatePlaybooks, incident, diagnosis);
            if (rankedPlaybooks.length === 0) {
                throw new types_1.EscalationError("PLAYBOOKS_FAILED_PREREQUISITES", "repair-selection", "All playbooks failed prerequisite checks");
            }
            // Step 3: Select top playbook
            const selectedPlaybook = rankedPlaybooks[0].playbook;
            // Step 4: Determine authorization level
            const authorizationLevel = this.determineAuthorizationLevel(diagnosis.severity, diagnosis.confidence, selectedPlaybook);
            // Step 5: Compose repair proposal
            const proposal = {
                incident_id: incident.incident_id,
                selected_timestamp: new Date().toISOString(),
                playbook_id: selectedPlaybook.playbook_id,
                playbook_name: selectedPlaybook.playbook_name,
                repair_steps: selectedPlaybook.repair_steps,
                expected_outcome: this.generateExpectedOutcome(diagnosis, selectedPlaybook),
                risk_assessment: {
                    risk_level: selectedPlaybook.risk_level,
                    risks: selectedPlaybook.risk_analysis.risks,
                    blast_radius: selectedPlaybook.risk_analysis.blast_radius,
                    rollback_possible: selectedPlaybook.rollback_procedure.length > 0,
                    rollback_procedure: selectedPlaybook.rollback_procedure
                },
                authorization_level: authorizationLevel,
                execution_context: selectedPlaybook.execution_context,
                success_criteria: selectedPlaybook.success_criteria
            };
            console.log(`[REPAIR-SELECTION] Selected playbook ${selectedPlaybook.playbook_id} for incident ` +
                `${incident.incident_id} in ${Date.now() - startTime}ms. ` +
                `Authorization level: ${authorizationLevel}`);
            return proposal;
        }
        catch (error) {
            const err = error;
            console.error(`[REPAIR-SELECTION] Error processing incident ${incident.incident_id}:`, (0, errors_1.createErrorLog)(err, "repair-selection", incident.incident_id));
            throw error;
        }
    }
    queryPlaybooks(errorSignature) {
        const results = [];
        for (const playbook of this.playbookDatabase.values()) {
            if (playbook.error_signatures.includes(errorSignature)) {
                results.push(playbook);
            }
        }
        return results;
    }
    rankPlaybooks(playbooks, incident, diagnosis) {
        const ranked = [];
        for (const playbook of playbooks) {
            // Check prerequisites
            const prerequisitesPassed = this.checkPrerequisites(playbook, incident, diagnosis);
            if (!prerequisitesPassed) {
                continue;
            }
            // Calculate applicability score
            const score = this.calculateApplicabilityScore(playbook, diagnosis);
            ranked.push({ playbook, score });
        }
        // Sort by score (highest first)
        ranked.sort((a, b) => b.score - a.score);
        return ranked;
    }
    checkPrerequisites(playbook, incident, diagnosis) {
        for (const prerequisite of playbook.prerequisite_checks) {
            if (!this.evaluatePrerequisite(prerequisite, incident, diagnosis)) {
                if (prerequisite.fail_behavior === "ESCALATE") {
                    return false;
                }
            }
        }
        return true;
    }
    evaluatePrerequisite(prerequisite, incident, _diagnosis) {
        // Mock prerequisite evaluation
        if (prerequisite.check_id === "module_type_match") {
            const expectedType = prerequisite.validation_rule.match(/gemini|openai|airtable/i)?.[0];
            if (!expectedType)
                return true;
            const moduleType = incident.raw_error_payload.cause_module_type.toLowerCase();
            return moduleType.includes(expectedType.toLowerCase());
        }
        return true;
    }
    calculateApplicabilityScore(playbook, diagnosis) {
        let score = playbook.applicability_score || 50;
        // Boost for perfect error signature match
        if (playbook.error_signatures.includes(diagnosis.root_cause_category)) {
            score *= 1.2;
        }
        // Boost for high confidence diagnosis
        if (diagnosis.confidence === "HIGH") {
            score *= 1.15;
        }
        else if (diagnosis.confidence === "LOW") {
            score *= 0.8;
        }
        // Boost for successful track record
        if (playbook.test_success_rate && playbook.test_success_rate > 0.95) {
            score *= 1.1;
        }
        return Math.min(score, 100); // Cap at 100
    }
    determineAuthorizationLevel(severity, _confidence, playbook) {
        // AUTOMATIC for low-risk, low-severity repairs
        if (severity === types_1.Severity.LOW && playbook.risk_level === types_1.RiskLevel.LOW) {
            return types_1.AuthorizationLevel.AUTOMATIC;
        }
        // OWNER_APPROVAL for medium-to-high severity or medium-to-high risk
        if (severity === types_1.Severity.HIGH ||
            severity === types_1.Severity.MEDIUM ||
            playbook.risk_level === types_1.RiskLevel.MEDIUM ||
            playbook.risk_level === types_1.RiskLevel.HIGH) {
            return types_1.AuthorizationLevel.OWNER_APPROVAL;
        }
        // MANUAL_REVIEW for critical severity or unknown risk
        return types_1.AuthorizationLevel.MANUAL_REVIEW;
    }
    generateExpectedOutcome(diagnosis, playbook) {
        const causes = {
            [types_1.ErrorSignature.OUTPUT_EXHAUSTION]: "Output will not be truncated",
            [types_1.ErrorSignature.OPERATOR_ERROR]: "Module configuration will be corrected",
            [types_1.ErrorSignature.DOWNSTREAM_WRITE_REJECTION]: "Downstream system will accept the write",
            [types_1.ErrorSignature.LLM_SAFETY_FILTER]: "LLM safety filter will be resolved",
            [types_1.ErrorSignature.LLM_GENERATION_FAILURE]: "LLM generation will succeed",
            [types_1.ErrorSignature.DOWNSTREAM_RATE_LIMIT]: "Rate limit will be respected",
            [types_1.ErrorSignature.DOWNSTREAM_AUTH_FAILURE]: "Authentication will be corrected",
            [types_1.ErrorSignature.MAPPER_SYNTAX_ERROR]: "Mapper syntax will be corrected",
            [types_1.ErrorSignature.NULL_REFERENCE]: "Null reference will be resolved",
            [types_1.ErrorSignature.TYPE_ERROR_TRANSFORM]: "Type transformation will succeed",
            [types_1.ErrorSignature.UNKNOWN_ERROR]: "Error will be resolved"
        };
        const causeFix = causes[diagnosis.root_cause_category] || "Error will be resolved";
        const successCriteria = playbook.success_criteria
            .map(c => c.description)
            .join("; ")
            .substring(0, 100);
        return `${causeFix}. Success criteria: ${successCriteria}`;
    }
    initializeDefaultPlaybooks() {
        // Playbook 1: Output Exhaustion (Gemini)
        this.playbookDatabase.set("output_exhaustion_gemini_001", {
            playbook_id: "output_exhaustion_gemini_001",
            playbook_name: "Gemini Token Limit Exhaustion Fix",
            description: "Addresses Gemini max_tokens ceiling causing JSON truncation",
            error_signatures: [types_1.ErrorSignature.OUTPUT_EXHAUSTION],
            prerequisite_checks: [
                {
                    check_id: "module_type_match",
                    description: "Affected module must be Gemini",
                    validation_rule: "root_cause_module.type LIKE 'gemini%'",
                    fail_behavior: "ESCALATE"
                }
            ],
            execution_context: {
                platform: "Make.com"
            },
            repair_steps: [
                {
                    step_num: 1,
                    description: "Increase Gemini max_tokens from 1000 to 2000",
                    action_type: "update_module_parameter",
                    parameters: {
                        parameter_name: "max_tokens",
                        new_value: 2000,
                        value_type: "number"
                    },
                    expected_result: "Module configuration updated"
                },
                {
                    step_num: 2,
                    description: "Add fallback summarization for overflow",
                    action_type: "add_error_handler",
                    parameters: {
                        error_handler_type: "output_truncation_fallback",
                        fallback_action: "summarize_output"
                    },
                    expected_result: "Error handler configured"
                },
                {
                    step_num: 3,
                    description: "Test with original failing input",
                    action_type: "execute_test",
                    parameters: {
                        timeout_seconds: 30
                    },
                    expected_result: "Module completes without truncation"
                }
            ],
            rollback_procedure: [
                {
                    step_num: 1,
                    description: "Revert max_tokens to 1000",
                    action_type: "update_module_parameter",
                    parameters: {
                        parameter_name: "max_tokens",
                        new_value: 1000
                    }
                }
            ],
            success_criteria: [
                {
                    criterion_id: "output_not_truncated",
                    description: "Verify output is not truncated",
                    verification_check: {
                        type: "per_module_io_inspection",
                        assertion: "output.length < max_tokens * 0.95"
                    }
                }
            ],
            risk_level: types_1.RiskLevel.MEDIUM,
            risk_analysis: {
                risks: [
                    {
                        risk_id: "performance_degradation",
                        description: "Higher token limit may increase API latency",
                        mitigation: "Monitor execution time after repair"
                    }
                ],
                blast_radius: "Single scenario only"
            },
            applicability_score: 95,
            created_by: "system",
            created_date: new Date().toISOString(),
            test_success_rate: 0.98
        });
        // Playbook 2: Operator Error (Parameter Type Fix)
        this.playbookDatabase.set("operator_error_parameter_fix_001", {
            playbook_id: "operator_error_parameter_fix_001",
            playbook_name: "Parameter Type Correction",
            description: "Fixes parameters typed as strings when APIs require numbers",
            error_signatures: [types_1.ErrorSignature.OPERATOR_ERROR],
            prerequisite_checks: [],
            execution_context: {
                platform: "Make.com"
            },
            repair_steps: [
                {
                    step_num: 1,
                    description: "Convert string parameters to numeric types",
                    action_type: "update_module_parameter",
                    parameters: {
                        auto_convert_types: true
                    },
                    expected_result: "All parameters have correct types"
                },
                {
                    step_num: 2,
                    description: "Test with original failing input",
                    action_type: "execute_test",
                    parameters: {
                        timeout_seconds: 30
                    },
                    expected_result: "Module accepts parameters and completes"
                }
            ],
            rollback_procedure: [
                {
                    step_num: 1,
                    description: "Revert parameter types to original values",
                    action_type: "revert_module_parameters"
                }
            ],
            success_criteria: [
                {
                    criterion_id: "type_correction",
                    description: "Verify parameter types match API spec",
                    verification_check: {
                        type: "per_module_io_inspection",
                        assertion: "all_parameters_have_correct_types"
                    }
                }
            ],
            risk_level: types_1.RiskLevel.LOW,
            risk_analysis: {
                risks: [],
                blast_radius: "Single scenario only"
            },
            applicability_score: 90,
            created_by: "system",
            created_date: new Date().toISOString(),
            test_success_rate: 0.99
        });
        // Playbook 3: Downstream Write Rejection
        this.playbookDatabase.set("downstream_write_rejection_001", {
            playbook_id: "downstream_write_rejection_001",
            playbook_name: "Downstream Write Validation Fix",
            description: "Validates data against downstream system schema before write",
            error_signatures: [types_1.ErrorSignature.DOWNSTREAM_WRITE_REJECTION],
            prerequisite_checks: [],
            execution_context: {
                platform: "Make.com"
            },
            repair_steps: [
                {
                    step_num: 1,
                    description: "Add schema validation before write",
                    action_type: "add_validation_step",
                    parameters: {
                        validation_type: "schema_conformance"
                    },
                    expected_result: "Validation step added to pipeline"
                },
                {
                    step_num: 2,
                    description: "Transform data to match downstream schema",
                    action_type: "add_mapper",
                    parameters: {
                        mapper_type: "schema_adapter"
                    },
                    expected_result: "Data transformer configured"
                }
            ],
            rollback_procedure: [
                {
                    step_num: 1,
                    description: "Remove validation step and mapper",
                    action_type: "remove_modules",
                    parameters: {
                        module_types: ["validation_step", "mapper"]
                    }
                }
            ],
            success_criteria: [
                {
                    criterion_id: "write_accepted",
                    description: "Downstream system accepts the write",
                    verification_check: {
                        type: "per_module_io_inspection",
                        assertion: "downstream_module.status == SUCCESS"
                    }
                }
            ],
            risk_level: types_1.RiskLevel.MEDIUM,
            risk_analysis: {
                risks: [
                    {
                        risk_id: "data_loss",
                        description: "Schema transformation might lose some fields",
                        mitigation: "Log dropped fields; validate with downstream schema"
                    }
                ],
                blast_radius: "Single scenario, downstream system"
            },
            applicability_score: 85,
            created_by: "system",
            created_date: new Date().toISOString(),
            test_success_rate: 0.92
        });
    }
    addPlaybook(playbook) {
        this.playbookDatabase.set(playbook.playbook_id, playbook);
        console.log(`[REPAIR-SELECTION] Added playbook ${playbook.playbook_id}`);
    }
    getPlaybook(playbookId) {
        return this.playbookDatabase.get(playbookId);
    }
    listPlaybooks() {
        return Array.from(this.playbookDatabase.values());
    }
}
exports.RepairSelectionEngine = RepairSelectionEngine;
//# sourceMappingURL=repair-selection.js.map