/**
 * Reconciliation Component (VERIFYING → RECONCILING → CLOSED/BLOCKED)
 * Performs final safety checks: malformed-write check + duplicate prevention check (CRITICAL BLOCKER)
 */
import { Incident, ReconciliationResult, SignalRecord, AirtableRecord } from "../types";
export declare class ReconciliationEngine {
    private signalDatabase;
    private airtableRecords;
    constructor();
    process(incident: Incident): Promise<ReconciliationResult>;
    private performMalformedWriteCheck;
    private performDuplicateCheck;
    private determineTerminalStatus;
    private queryAirtableRecords;
    private querySignalsBeforeTimestamp;
    private validateRecordSchema;
    private validateFieldTypes;
    private isTruncated;
    private createSignalRecord;
    addSignal(signal: SignalRecord): void;
    addAirtableRecord(record: AirtableRecord): void;
    getSignal(signalId: string): SignalRecord | undefined;
    listSignals(): SignalRecord[];
}
//# sourceMappingURL=reconciliation.d.ts.map