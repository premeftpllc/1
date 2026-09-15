/**
 * Control Plane Orchestrator
 * Coordinates the 4-component pipeline for incident processing
 */

import { DiagnosisEngine } from "./diagnosis";
import { RepairSelectionEngine } from "./repair-selection";
import { VerificationEngine } from "./verification";
import { ReconciliationEngine } from "./reconciliation";
import {
  Incident,
  IncidentState,
  LifecycleEvent,
  MakeExecutionResponse
} from "../types";

export class ControlPlaneOrchestrator {
  private diagnosisEngine: DiagnosisEngine;
  private repairSelectionEngine: RepairSelectionEngine;
  private verificationEngine: VerificationEngine;
  private reconciliationEngine: ReconciliationEngine;

  constructor() {
    this.diagnosisEngine = new DiagnosisEngine();
    this.repairSelectionEngine = new RepairSelectionEngine();
    this.verificationEngine = new VerificationEngine();
    this.reconciliationEngine = new ReconciliationEngine();
  }

  async processIncident(incident: Incident): Promise<Incident> {
    console.log(`[ORCHESTRATOR] Starting pipeline for incident ${incident.incident_id}`);

    try {
      // TRIAGED: Run Diagnosis Engine
      if (incident.state === IncidentState.RECEIVED) {
        console.log(`[ORCHESTRATOR] → TRIAGED: Running Diagnosis`);
        const diagnosis = await this.diagnosisEngine.process(incident);
        incident.diagnosis = diagnosis;
        incident.state = IncidentState.TRIAGED;
        this.addLifecycleEvent(incident, IncidentState.TRIAGED, "diagnosis", {
          root_cause_category: diagnosis.root_cause_category,
          severity: diagnosis.severity,
          confidence: diagnosis.confidence
        });
      }

      // AWAITING_APPROVAL: Run Repair Selection Engine
      if (incident.state === IncidentState.TRIAGED) {
        console.log(`[ORCHESTRATOR] → AWAITING_APPROVAL: Running Repair Selection`);
        const repairProposal = await this.repairSelectionEngine.process(incident);
        incident.repair_proposal = repairProposal;
        incident.state = IncidentState.AWAITING_APPROVAL;
        this.addLifecycleEvent(
          incident,
          IncidentState.AWAITING_APPROVAL,
          "repair-selection",
          {
            playbook_id: repairProposal.playbook_id,
            authorization_level: repairProposal.authorization_level
          }
        );
      }

      // DIAGNOSING: Placeholder for external approval/execution
      if (incident.state === IncidentState.AWAITING_APPROVAL) {
        console.log(
          `[ORCHESTRATOR] → DIAGNOSING: Awaiting external approval and execution`
        );
        incident.state = IncidentState.DIAGNOSING;
        this.addLifecycleEvent(incident, IncidentState.DIAGNOSING, "orchestrator", {
          status: "awaiting_external_execution"
        });
      }

      return incident;
    } catch (error) {
      const err = error as Error;
      console.error(
        `[ORCHESTRATOR] Pipeline failed for incident ${incident.incident_id}: ${err.message}`
      );
      incident.state = IncidentState.ESCALATED;
      this.addLifecycleEvent(incident, IncidentState.ESCALATED, "orchestrator", {
        error: err.message
      });
      throw error;
    }
  }

  async verifyRepair(
    incident: Incident,
    executionId: string,
    executionOutcome: MakeExecutionResponse
  ): Promise<Incident> {
    console.log(`[ORCHESTRATOR] Verifying repair for incident ${incident.incident_id}`);

    try {
      if (incident.state !== IncidentState.EXECUTING) {
        throw new Error(
          `Invalid state for verification: ${incident.state}. Expected EXECUTING.`
        );
      }

      // VERIFYING: Run Verification Engine
      console.log(`[ORCHESTRATOR] → VERIFYING: Running Verification`);
      const verificationOutput = await this.verificationEngine.process(
        incident,
        executionId,
        executionOutcome
      );

      incident.verification_result = verificationOutput.verification_result;
      incident.state = verificationOutput.next_state;
      this.addLifecycleEvent(incident, IncidentState.VERIFYING, "verification", {
        verification_result: verificationOutput.verification_result,
        regression_detected: verificationOutput.regression_detected,
        checks_performed: verificationOutput.verification_checks_performed.length
      });

      return incident;
    } catch (error) {
      const err = error as Error;
      console.error(
        `[ORCHESTRATOR] Verification failed for incident ${incident.incident_id}: ${err.message}`
      );
      incident.state = IncidentState.BLOCKED;
      this.addLifecycleEvent(incident, IncidentState.BLOCKED, "orchestrator", {
        error: err.message
      });
      throw error;
    }
  }

  async reconcile(incident: Incident): Promise<Incident> {
    console.log(`[ORCHESTRATOR] Reconciling incident ${incident.incident_id}`);

    try {
      if (incident.state !== IncidentState.VERIFYING) {
        throw new Error(
          `Invalid state for reconciliation: ${incident.state}. Expected VERIFYING.`
        );
      }

      // RECONCILING: Run Reconciliation Engine
      console.log(`[ORCHESTRATOR] → RECONCILING/CLOSED/BLOCKED: Running Reconciliation`);
      const reconciliationResult = await this.reconciliationEngine.process(incident);

      incident.reconciliation_status = reconciliationResult;
      incident.state = reconciliationResult.next_state;
      this.addLifecycleEvent(incident, IncidentState.RECONCILING, "reconciliation", {
        terminal_status: reconciliationResult.terminal_status,
        duplicate_prevented: reconciliationResult.duplicate_check.prevented_duplicate_creation
      });

      if (reconciliationResult.next_state === IncidentState.CLOSED) {
        this.addLifecycleEvent(incident, IncidentState.CLOSED, "orchestrator", {
          final_status: reconciliationResult.terminal_status
        });
      } else if (reconciliationResult.next_state === IncidentState.BLOCKED) {
        this.addLifecycleEvent(incident, IncidentState.BLOCKED, "orchestrator", {
          final_status: reconciliationResult.terminal_status,
          requires_manual_review: true
        });
      }

      return incident;
    } catch (error) {
      const err = error as Error;
      console.error(
        `[ORCHESTRATOR] Reconciliation failed for incident ${incident.incident_id}: ${err.message}`
      );
      incident.state = IncidentState.BLOCKED;
      this.addLifecycleEvent(incident, IncidentState.BLOCKED, "orchestrator", {
        error: err.message
      });
      throw error;
    }
  }

  private addLifecycleEvent(
    incident: Incident,
    state: IncidentState,
    component: string,
    data?: Record<string, any>
  ): void {
    const event: LifecycleEvent = {
      event: state,
      timestamp: new Date().toISOString(),
      component,
      data
    };

    incident.lifecycle_log.push(event);
  }

  // Getters for testing
  getDiagnosisEngine(): DiagnosisEngine {
    return this.diagnosisEngine;
  }

  getRepairSelectionEngine(): RepairSelectionEngine {
    return this.repairSelectionEngine;
  }

  getVerificationEngine(): VerificationEngine {
    return this.verificationEngine;
  }

  getReconciliationEngine(): ReconciliationEngine {
    return this.reconciliationEngine;
  }
}
