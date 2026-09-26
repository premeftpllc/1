/**
 * Control Plane Orchestrator
 * Coordinates the 4-component pipeline for incident processing
 */
import { DiagnosisEngine } from "./diagnosis";
import { RepairSelectionEngine } from "./repair-selection";
import { VerificationEngine } from "./verification";
import { ReconciliationEngine } from "./reconciliation";
import { Incident, MakeExecutionResponse } from "../types";
export declare class ControlPlaneOrchestrator {
    private diagnosisEngine;
    private repairSelectionEngine;
    private verificationEngine;
    private reconciliationEngine;
    constructor();
    processIncident(incident: Incident): Promise<Incident>;
    verifyRepair(incident: Incident, executionId: string, executionOutcome: MakeExecutionResponse): Promise<Incident>;
    reconcile(incident: Incident): Promise<Incident>;
    private addLifecycleEvent;
    getDiagnosisEngine(): DiagnosisEngine;
    getRepairSelectionEngine(): RepairSelectionEngine;
    getVerificationEngine(): VerificationEngine;
    getReconciliationEngine(): ReconciliationEngine;
}
//# sourceMappingURL=orchestrator.d.ts.map