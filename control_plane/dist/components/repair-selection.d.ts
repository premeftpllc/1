/**
 * Repair Selection Component (TRIAGED → AWAITING_APPROVAL)
 * Matches diagnosis to repair playbooks and determines authorization level
 */
import { Incident, RepairProposal, RepairPlaybook } from "../types";
export declare class RepairSelectionEngine {
    private playbookDatabase;
    constructor();
    process(incident: Incident): Promise<RepairProposal>;
    private queryPlaybooks;
    private rankPlaybooks;
    private checkPrerequisites;
    private evaluatePrerequisite;
    private calculateApplicabilityScore;
    private determineAuthorizationLevel;
    private generateExpectedOutcome;
    private initializeDefaultPlaybooks;
    addPlaybook(playbook: RepairPlaybook): void;
    getPlaybook(playbookId: string): RepairPlaybook | undefined;
    listPlaybooks(): RepairPlaybook[];
}
//# sourceMappingURL=repair-selection.d.ts.map