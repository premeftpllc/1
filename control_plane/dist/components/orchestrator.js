"use strict";
/**
 * Control Plane Orchestrator
 * Coordinates the 4-component pipeline for incident processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlPlaneOrchestrator = void 0;
const diagnosis_1 = require("./diagnosis");
const repair_selection_1 = require("./repair-selection");
const verification_1 = require("./verification");
const reconciliation_1 = require("./reconciliation");
const types_1 = require("../types");
class ControlPlaneOrchestrator {
    constructor() {
        this.diagnosisEngine = new diagnosis_1.DiagnosisEngine();
        this.repairSelectionEngine = new repair_selection_1.RepairSelectionEngine();
        this.verificationEngine = new verification_1.VerificationEngine();
        this.reconciliationEngine = new reconciliation_1.ReconciliationEngine();
    }
    async processIncident(incident) {
        console.log(`[ORCHESTRATOR] Starting pipeline for incident ${incident.incident_id}`);
        try {
            // TRIAGED: Run Diagnosis Engine
            if (incident.state === types_1.IncidentState.RECEIVED) {
                console.log(`[ORCHESTRATOR] → TRIAGED: Running Diagnosis`);
                const diagnosis = await this.diagnosisEngine.process(incident);
                incident.diagnosis = diagnosis;
                incident.state = types_1.IncidentState.TRIAGED;
                this.addLifecycleEvent(incident, types_1.IncidentState.TRIAGED, "diagnosis", {
                    root_cause_category: diagnosis.root_cause_category,
                    severity: diagnosis.severity,
                    confidence: diagnosis.confidence
                });
            }
            // AWAITING_APPROVAL: Run Repair Selection Engine
            if (incident.state === types_1.IncidentState.TRIAGED) {
                console.log(`[ORCHESTRATOR] → AWAITING_APPROVAL: Running Repair Selection`);
                const repairProposal = await this.repairSelectionEngine.process(incident);
                incident.repair_proposal = repairProposal;
                incident.state = types_1.IncidentState.AWAITING_APPROVAL;
                this.addLifecycleEvent(incident, types_1.IncidentState.AWAITING_APPROVAL, "repair-selection", {
                    playbook_id: repairProposal.playbook_id,
                    authorization_level: repairProposal.authorization_level
                });
            }
            // DIAGNOSING: Placeholder for external approval/execution
            if (incident.state === types_1.IncidentState.AWAITING_APPROVAL) {
                console.log(`[ORCHESTRATOR] → DIAGNOSING: Awaiting external approval and execution`);
                incident.state = types_1.IncidentState.DIAGNOSING;
                this.addLifecycleEvent(incident, types_1.IncidentState.DIAGNOSING, "orchestrator", {
                    status: "awaiting_external_execution"
                });
            }
            return incident;
        }
        catch (error) {
            const err = error;
            console.error(`[ORCHESTRATOR] Pipeline failed for incident ${incident.incident_id}: ${err.message}`);
            incident.state = types_1.IncidentState.ESCALATED;
            this.addLifecycleEvent(incident, types_1.IncidentState.ESCALATED, "orchestrator", {
                error: err.message
            });
            throw error;
        }
    }
    async verifyRepair(incident, executionId, executionOutcome) {
        console.log(`[ORCHESTRATOR] Verifying repair for incident ${incident.incident_id}`);
        try {
            if (incident.state !== types_1.IncidentState.EXECUTING) {
                throw new Error(`Invalid state for verification: ${incident.state}. Expected EXECUTING.`);
            }
            // VERIFYING: Run Verification Engine
            console.log(`[ORCHESTRATOR] → VERIFYING: Running Verification`);
            const verificationOutput = await this.verificationEngine.process(incident, executionId, executionOutcome);
            incident.verification_result = verificationOutput.verification_result;
            incident.state = verificationOutput.next_state;
            this.addLifecycleEvent(incident, types_1.IncidentState.VERIFYING, "verification", {
                verification_result: verificationOutput.verification_result,
                regression_detected: verificationOutput.regression_detected,
                checks_performed: verificationOutput.verification_checks_performed.length
            });
            return incident;
        }
        catch (error) {
            const err = error;
            console.error(`[ORCHESTRATOR] Verification failed for incident ${incident.incident_id}: ${err.message}`);
            incident.state = types_1.IncidentState.BLOCKED;
            this.addLifecycleEvent(incident, types_1.IncidentState.BLOCKED, "orchestrator", {
                error: err.message
            });
            throw error;
        }
    }
    async reconcile(incident) {
        console.log(`[ORCHESTRATOR] Reconciling incident ${incident.incident_id}`);
        try {
            if (incident.state !== types_1.IncidentState.VERIFYING) {
                throw new Error(`Invalid state for reconciliation: ${incident.state}. Expected VERIFYING.`);
            }
            // RECONCILING: Run Reconciliation Engine
            console.log(`[ORCHESTRATOR] → RECONCILING/CLOSED/BLOCKED: Running Reconciliation`);
            const reconciliationResult = await this.reconciliationEngine.process(incident);
            incident.reconciliation_status = reconciliationResult;
            incident.state = reconciliationResult.next_state;
            this.addLifecycleEvent(incident, types_1.IncidentState.RECONCILING, "reconciliation", {
                terminal_status: reconciliationResult.terminal_status,
                duplicate_prevented: reconciliationResult.duplicate_check.prevented_duplicate_creation
            });
            if (reconciliationResult.next_state === types_1.IncidentState.CLOSED) {
                this.addLifecycleEvent(incident, types_1.IncidentState.CLOSED, "orchestrator", {
                    final_status: reconciliationResult.terminal_status
                });
            }
            else if (reconciliationResult.next_state === types_1.IncidentState.BLOCKED) {
                this.addLifecycleEvent(incident, types_1.IncidentState.BLOCKED, "orchestrator", {
                    final_status: reconciliationResult.terminal_status,
                    requires_manual_review: true
                });
            }
            return incident;
        }
        catch (error) {
            const err = error;
            console.error(`[ORCHESTRATOR] Reconciliation failed for incident ${incident.incident_id}: ${err.message}`);
            incident.state = types_1.IncidentState.BLOCKED;
            this.addLifecycleEvent(incident, types_1.IncidentState.BLOCKED, "orchestrator", {
                error: err.message
            });
            throw error;
        }
    }
    addLifecycleEvent(incident, state, component, data) {
        const event = {
            event: state,
            timestamp: new Date().toISOString(),
            component,
            data
        };
        incident.lifecycle_log.push(event);
    }
    // Getters for testing
    getDiagnosisEngine() {
        return this.diagnosisEngine;
    }
    getRepairSelectionEngine() {
        return this.repairSelectionEngine;
    }
    getVerificationEngine() {
        return this.verificationEngine;
    }
    getReconciliationEngine() {
        return this.reconciliationEngine;
    }
}
exports.ControlPlaneOrchestrator = ControlPlaneOrchestrator;
//# sourceMappingURL=orchestrator.js.map