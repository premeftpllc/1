/**
 * Verification Component (EXECUTING → VERIFYING)
 * Performs dual checks: success (was root cause resolved?) and regression (new errors introduced?)
 */
import { Incident, VerificationOutput, MakeExecutionResponse } from "../types";
export declare class VerificationEngine {
    process(incident: Incident, _executionId: string, executionOutcome: MakeExecutionResponse): Promise<VerificationOutput>;
    private performSuccessCheck;
    private performRegressionCheck;
    private extractModuleId;
    private detectTruncation;
    private detectExecutionErrors;
    private findDownstreamModule;
    private countDLQRecords;
    private countErrors;
    private generateFailureReason;
}
//# sourceMappingURL=verification.d.ts.map