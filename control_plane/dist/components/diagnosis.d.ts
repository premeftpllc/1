/**
 * Diagnosis Component (RECEIVED → TRIAGED)
 * Analyzes error payloads and evidence to form root cause hypothesis
 */
import { Incident, Diagnosis } from "../types";
export declare class DiagnosisEngine {
    process(incident: Incident): Promise<Diagnosis>;
    private classifyErrorSignature;
    private analyzeParameterMismatches;
    private getComponentLimits;
    private determineRootCause;
    private classifySeverity;
    private classifyConfidence;
    private generateRemediationSuggestions;
    private extractAffectedFields;
    private generateDiagnosisText;
}
//# sourceMappingURL=diagnosis.d.ts.map