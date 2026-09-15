/**
 * Repair Selection Component (TRIAGED → AWAITING_APPROVAL)
 * Matches diagnosis to repair playbooks and determines authorization level
 */

import {
  Incident,
  Diagnosis,
  RepairProposal,
  RepairPlaybook,
  AuthorizationLevel,
  Severity,
  Confidence,
  EscalationError,
  ErrorSignature,
  RiskLevel
} from "../types";
import { createErrorLog } from "../utils/errors";

export class RepairSelectionEngine {
  private playbookDatabase: Map<string, RepairPlaybook>;

  constructor() {
    this.playbookDatabase = new Map();
    this.initializeDefaultPlaybooks();
  }

  async process(incident: Incident): Promise<RepairProposal> {
    const startTime = Date.now();

    try {
      if (!incident.diagnosis) {
        throw new EscalationError(
          "MISSING_DIAGNOSIS",
          "repair-selection",
          "Incident does not have diagnosis"
        );
      }

      const diagnosis = incident.diagnosis;
      const rootCauseCategory = diagnosis.root_cause_category;

      // Step 1: Query Repair Playbook database
      const candidatePlaybooks = this.queryPlaybooks(rootCauseCategory);

      if (candidatePlaybooks.length === 0) {
        throw new EscalationError(
          "NO_PLAYBOOK_FOUND",
          "repair-selection",
          `No playbook found for error_signature=${rootCauseCategory}`
        );
      }

      // Step 2: Rank playbooks by applicability
      const rankedPlaybooks = this.rankPlaybooks(
        candidatePlaybooks,
        incident,
        diagnosis
      );

      if (rankedPlaybooks.length === 0) {
        throw new EscalationError(
          "PLAYBOOKS_FAILED_PREREQUISITES",
          "repair-selection",
          "All playbooks failed prerequisite checks"
        );
      }

      // Step 3: Select top playbook
      const selectedPlaybook = rankedPlaybooks[0].playbook;

      // Step 4: Determine authorization level
      const authorizationLevel = this.determineAuthorizationLevel(
        diagnosis.severity,
        diagnosis.confidence,
        selectedPlaybook
      );

      // Step 5: Compose repair proposal
      const proposal: RepairProposal = {
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

      console.log(
        `[REPAIR-SELECTION] Selected playbook ${selectedPlaybook.playbook_id} for incident ` +
        `${incident.incident_id} in ${Date.now() - startTime}ms. ` +
        `Authorization level: ${authorizationLevel}`
      );

      return proposal;
    } catch (error) {
      const err = error as Error;
      console.error(
        `[REPAIR-SELECTION] Error processing incident ${incident.incident_id}:`,
        createErrorLog(err, "repair-selection", incident.incident_id)
      );
      throw error;
    }
  }

  private queryPlaybooks(errorSignature: ErrorSignature): RepairPlaybook[] {
    const results: RepairPlaybook[] = [];

    for (const playbook of this.playbookDatabase.values()) {
      if (playbook.error_signatures.includes(errorSignature)) {
        results.push(playbook);
      }
    }

    return results;
  }

  private rankPlaybooks(
    playbooks: RepairPlaybook[],
    incident: Incident,
    diagnosis: Diagnosis
  ): Array<{ playbook: RepairPlaybook; score: number }> {
    const ranked: Array<{ playbook: RepairPlaybook; score: number }> = [];

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

  private checkPrerequisites(
    playbook: RepairPlaybook,
    incident: Incident,
    diagnosis: Diagnosis
  ): boolean {
    for (const prerequisite of playbook.prerequisite_checks) {
      if (!this.evaluatePrerequisite(prerequisite, incident, diagnosis)) {
        if (prerequisite.fail_behavior === "ESCALATE") {
          return false;
        }
      }
    }
    return true;
  }

  private evaluatePrerequisite(
    prerequisite: any,
    incident: Incident,
    _diagnosis: Diagnosis
  ): boolean {
    // Mock prerequisite evaluation
    if (prerequisite.check_id === "module_type_match") {
      const expectedType = prerequisite.validation_rule.match(/gemini|openai|airtable/i)?.[0];
      if (!expectedType) return true;

      const moduleType = incident.raw_error_payload.cause_module_type.toLowerCase();
      return moduleType.includes(expectedType.toLowerCase());
    }

    return true;
  }

  private calculateApplicabilityScore(
    playbook: RepairPlaybook,
    diagnosis: Diagnosis
  ): number {
    let score = playbook.applicability_score || 50;

    // Boost for perfect error signature match
    if (playbook.error_signatures.includes(diagnosis.root_cause_category)) {
      score *= 1.2;
    }

    // Boost for high confidence diagnosis
    if (diagnosis.confidence === "HIGH") {
      score *= 1.15;
    } else if (diagnosis.confidence === "LOW") {
      score *= 0.8;
    }

    // Boost for successful track record
    if (playbook.test_success_rate && playbook.test_success_rate > 0.95) {
      score *= 1.1;
    }

    return Math.min(score, 100); // Cap at 100
  }

  private determineAuthorizationLevel(
    severity: Severity,
    _confidence: Confidence,
    playbook: RepairPlaybook
  ): AuthorizationLevel {
    // AUTOMATIC for low-risk, low-severity repairs
    if (severity === Severity.LOW && playbook.risk_level === RiskLevel.LOW) {
      return AuthorizationLevel.AUTOMATIC;
    }

    // OWNER_APPROVAL for medium-to-high severity or medium-to-high risk
    if (
      severity === Severity.HIGH ||
      severity === Severity.MEDIUM ||
      playbook.risk_level === RiskLevel.MEDIUM ||
      playbook.risk_level === RiskLevel.HIGH
    ) {
      return AuthorizationLevel.OWNER_APPROVAL;
    }

    // MANUAL_REVIEW for critical severity or unknown risk
    return AuthorizationLevel.MANUAL_REVIEW;
  }

  private generateExpectedOutcome(diagnosis: Diagnosis, playbook: RepairPlaybook): string {
    const causes: Record<ErrorSignature, string> = {
      [ErrorSignature.OUTPUT_EXHAUSTION]: "Output will not be truncated",
      [ErrorSignature.OPERATOR_ERROR]: "Module configuration will be corrected",
      [ErrorSignature.DOWNSTREAM_WRITE_REJECTION]: "Downstream system will accept the write",
      [ErrorSignature.LLM_SAFETY_FILTER]: "LLM safety filter will be resolved",
      [ErrorSignature.LLM_GENERATION_FAILURE]: "LLM generation will succeed",
      [ErrorSignature.DOWNSTREAM_RATE_LIMIT]: "Rate limit will be respected",
      [ErrorSignature.DOWNSTREAM_AUTH_FAILURE]: "Authentication will be corrected",
      [ErrorSignature.MAPPER_SYNTAX_ERROR]: "Mapper syntax will be corrected",
      [ErrorSignature.NULL_REFERENCE]: "Null reference will be resolved",
      [ErrorSignature.TYPE_ERROR_TRANSFORM]: "Type transformation will succeed",
      [ErrorSignature.UNKNOWN_ERROR]: "Error will be resolved"
    };

    const causeFix = causes[diagnosis.root_cause_category] || "Error will be resolved";
    const successCriteria = playbook.success_criteria
      .map(c => c.description)
      .join("; ")
      .substring(0, 100);

    return `${causeFix}. Success criteria: ${successCriteria}`;
  }

  private initializeDefaultPlaybooks(): void {
    // Playbook 1: Output Exhaustion (Gemini)
    this.playbookDatabase.set(
      "output_exhaustion_gemini_001",
      {
        playbook_id: "output_exhaustion_gemini_001",
        playbook_name: "Gemini Token Limit Exhaustion Fix",
        description: "Addresses Gemini max_tokens ceiling causing JSON truncation",
        error_signatures: [ErrorSignature.OUTPUT_EXHAUSTION],
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
        risk_level: RiskLevel.MEDIUM,
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
      }
    );

    // Playbook 2: Operator Error (Parameter Type Fix)
    this.playbookDatabase.set(
      "operator_error_parameter_fix_001",
      {
        playbook_id: "operator_error_parameter_fix_001",
        playbook_name: "Parameter Type Correction",
        description: "Fixes parameters typed as strings when APIs require numbers",
        error_signatures: [ErrorSignature.OPERATOR_ERROR],
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
        risk_level: RiskLevel.LOW,
        risk_analysis: {
          risks: [],
          blast_radius: "Single scenario only"
        },
        applicability_score: 90,
        created_by: "system",
        created_date: new Date().toISOString(),
        test_success_rate: 0.99
      }
    );

    // Playbook 3: Downstream Write Rejection
    this.playbookDatabase.set(
      "downstream_write_rejection_001",
      {
        playbook_id: "downstream_write_rejection_001",
        playbook_name: "Downstream Write Validation Fix",
        description: "Validates data against downstream system schema before write",
        error_signatures: [ErrorSignature.DOWNSTREAM_WRITE_REJECTION],
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
        risk_level: RiskLevel.MEDIUM,
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
      }
    );
  }

  addPlaybook(playbook: RepairPlaybook): void {
    this.playbookDatabase.set(playbook.playbook_id, playbook);
    console.log(`[REPAIR-SELECTION] Added playbook ${playbook.playbook_id}`);
  }

  getPlaybook(playbookId: string): RepairPlaybook | undefined {
    return this.playbookDatabase.get(playbookId);
  }

  listPlaybooks(): RepairPlaybook[] {
    return Array.from(this.playbookDatabase.values());
  }
}
