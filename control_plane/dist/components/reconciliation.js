"use strict";
/**
 * Reconciliation Component (VERIFYING → RECONCILING → CLOSED/BLOCKED)
 * Performs final safety checks: malformed-write check + duplicate prevention check (CRITICAL BLOCKER)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationEngine = void 0;
const types_1 = require("../types");
const errors_1 = require("../utils/errors");
class ReconciliationEngine {
    constructor() {
        this.signalDatabase = new Map();
        this.airtableRecords = new Map();
    }
    async process(incident) {
        const startTime = Date.now();
        try {
            if (!incident.repair_proposal) {
                throw new types_1.EscalationError("MISSING_REPAIR_PROPOSAL", "reconciliation", "Incident does not have repair proposal");
            }
            // CRITICAL: Only proceed if verification passed
            const lastLifecycleEvent = incident.lifecycle_log[incident.lifecycle_log.length - 1];
            const verificationPassed = lastLifecycleEvent?.event === types_1.IncidentState.VERIFYING &&
                lastLifecycleEvent.data?.verification_result === types_1.VerificationResult.PASS;
            if (!verificationPassed) {
                const result = {
                    incident_id: incident.incident_id,
                    reconciled_timestamp: new Date().toISOString(),
                    reconciliation_result: "FAILED",
                    malformed_write_check: {
                        result: "PASSED",
                        affected_fields: [],
                        validation_errors: [],
                        records_validated: 0
                    },
                    duplicate_check: {
                        result: "PASSED",
                        is_duplicate: false,
                        prevented_duplicate_creation: false
                    },
                    terminal_status: types_1.TerminalStatus.BLOCKED_MALFORMED_WRITE,
                    completion_timestamp: new Date().toISOString(),
                    next_state: types_1.IncidentState.BLOCKED
                };
                return result;
            }
            // Step 1: Malformed-write check
            const malformedWriteCheck = await this.performMalformedWriteCheck(incident);
            // Step 2: CRITICAL - Duplicate check
            const duplicateCheck = await this.performDuplicateCheck(incident);
            // Step 3: Determine terminal status
            const terminalStatus = this.determineTerminalStatus(malformedWriteCheck, duplicateCheck);
            const result = {
                incident_id: incident.incident_id,
                reconciled_timestamp: new Date().toISOString(),
                reconciliation_result: terminalStatus === types_1.TerminalStatus.CLOSED_SUCCESS ? "PASSED" : "FAILED",
                malformed_write_check: malformedWriteCheck,
                duplicate_check: duplicateCheck,
                terminal_status: terminalStatus,
                completion_timestamp: new Date().toISOString(),
                next_state: terminalStatus === types_1.TerminalStatus.CLOSED_SUCCESS
                    ? types_1.IncidentState.CLOSED
                    : types_1.IncidentState.BLOCKED
            };
            // If passing reconciliation, create Signal record
            if (terminalStatus === types_1.TerminalStatus.CLOSED_SUCCESS) {
                this.createSignalRecord(incident);
            }
            console.log(`[RECONCILIATION] Reconciled incident ${incident.incident_id} in ${Date.now() - startTime}ms. ` +
                `Terminal status: ${terminalStatus}`);
            return result;
        }
        catch (error) {
            const err = error;
            console.error(`[RECONCILIATION] Error processing incident ${incident.incident_id}:`, (0, errors_1.createErrorLog)(err, "reconciliation", incident.incident_id));
            throw error;
        }
    }
    async performMalformedWriteCheck(incident) {
        const check = {
            result: "PASSED",
            affected_fields: [],
            validation_errors: [],
            records_validated: 0
        };
        try {
            // Query Airtable records by airtable_event_key
            const airtableRecords = this.queryAirtableRecords(incident.airtable_event_key);
            if (airtableRecords.length === 0) {
                check.evidence = { info: "No records found for airtable_event_key" };
                return check;
            }
            check.records_validated = airtableRecords.length;
            // Validate each record against schema
            for (const record of airtableRecords) {
                const schemaViolations = this.validateRecordSchema(record);
                if (schemaViolations.length > 0) {
                    check.affected_fields.push(...schemaViolations);
                    check.result = "FAILED";
                }
                // Check for truncation
                for (const [fieldName, fieldValue] of Object.entries(record.fields)) {
                    if (typeof fieldValue === "string" && this.isTruncated(fieldValue)) {
                        check.validation_errors.push({
                            field_name: fieldName,
                            error_type: "truncation_detected",
                            value_length: fieldValue.length
                        });
                        check.result = "FAILED";
                    }
                }
                // Check for type mismatches
                const typeErrors = this.validateFieldTypes(record);
                if (typeErrors.length > 0) {
                    check.validation_errors.push(...typeErrors);
                    check.result = "FAILED";
                }
            }
            check.evidence = {
                records_validated: check.records_validated,
                violations_found: check.affected_fields.length > 0,
                errors_found: check.validation_errors.length > 0
            };
            return check;
        }
        catch (error) {
            const err = error;
            console.warn(`[RECONCILIATION] Malformed-write check error: ${err.message}`);
            check.result = "FAILED";
            check.validation_errors.push({
                field_name: "unknown",
                error_type: "check_error",
                error: err.message
            });
            return check;
        }
    }
    async performDuplicateCheck(incident) {
        const check = {
            result: "PASSED",
            is_duplicate: false,
            prevented_duplicate_creation: false
        };
        try {
            // Query Signal database for pre-existing records with same airtable_event_key
            // created BEFORE this incident was received
            const preExistingSignals = this.querySignalsBeforeTimestamp(incident.airtable_event_key, new Date(incident.received_timestamp));
            if (preExistingSignals.length > 0) {
                // CRITICAL: Duplicate found - this incident must not create another Signal
                check.is_duplicate = true;
                check.pre_existing_signal_id = preExistingSignals[0].signal_id;
                check.result = "FAILED";
                check.prevented_duplicate_creation = true;
                console.warn(`[RECONCILIATION] CRITICAL: Duplicate Signal prevented for incident ` +
                    `${incident.incident_id}. Pre-existing Signal: ${preExistingSignals[0].signal_id}`);
            }
            check.evidence = {
                query_time_range: `before:${incident.received_timestamp}`,
                airtable_event_key: incident.airtable_event_key,
                pre_existing_signals_found: preExistingSignals.length,
                prevented_duplicate_creation: check.prevented_duplicate_creation
            };
            return check;
        }
        catch (error) {
            const err = error;
            console.error(`[RECONCILIATION] Duplicate check error: ${err.message}`);
            check.result = "FAILED";
            check.prevented_duplicate_creation = false;
            return check;
        }
    }
    determineTerminalStatus(malformedWriteCheck, duplicateCheck) {
        const malformedFailed = malformedWriteCheck.result === "FAILED";
        const duplicateFailed = duplicateCheck.result === "FAILED";
        if (malformedFailed && duplicateFailed) {
            return types_1.TerminalStatus.BLOCKED_MALFORMED_AND_DUPLICATE;
        }
        else if (malformedFailed) {
            return types_1.TerminalStatus.BLOCKED_MALFORMED_WRITE;
        }
        else if (duplicateFailed) {
            return types_1.TerminalStatus.BLOCKED_DUPLICATE;
        }
        else {
            return types_1.TerminalStatus.CLOSED_SUCCESS;
        }
    }
    queryAirtableRecords(eventKey) {
        const records = [];
        for (const record of this.airtableRecords.values()) {
            if (record.fields && record.fields.event_key === eventKey) {
                records.push(record);
            }
        }
        return records;
    }
    querySignalsBeforeTimestamp(eventKey, timestamp) {
        const signals = [];
        for (const signal of this.signalDatabase.values()) {
            if (signal.airtable_event_key === eventKey &&
                new Date(signal.created_at) < timestamp) {
                signals.push(signal);
            }
        }
        return signals;
    }
    validateRecordSchema(record) {
        // Mock schema validation - in production, would query actual Airtable schema
        const violations = [];
        const requiredFields = ["event_key", "status"];
        for (const fieldName of requiredFields) {
            if (!(fieldName in record.fields)) {
                violations.push({
                    module_path: fieldName,
                    current_type: "undefined",
                    expected_type: "string"
                });
            }
        }
        return violations;
    }
    validateFieldTypes(record) {
        const errors = [];
        const expectedTypes = {
            event_key: "string",
            status: "string",
            ai_score: "number",
            created_at: "string"
        };
        for (const [fieldName, expectedType] of Object.entries(expectedTypes)) {
            if (fieldName in record.fields) {
                const fieldValue = record.fields[fieldName];
                const actualType = typeof fieldValue;
                if (actualType !== expectedType && expectedType !== "object") {
                    errors.push({
                        field_name: fieldName,
                        error_type: "type_mismatch",
                        expected_type: expectedType,
                        actual_type: actualType
                    });
                }
            }
        }
        return errors;
    }
    isTruncated(value) {
        return (value.endsWith("[...") ||
            value.endsWith("{...") ||
            value.endsWith("...") ||
            (value.length > 10000 && value.endsWith("...")));
    }
    createSignalRecord(incident) {
        const signal = {
            signal_id: `sig_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            airtable_event_key: incident.airtable_event_key,
            created_at: new Date().toISOString(),
            incident_id_reference: incident.incident_id,
            status: "CREATED",
            lifecycle_state: types_1.IncidentState.CLOSED
        };
        this.signalDatabase.set(signal.signal_id, signal);
        console.log(`[RECONCILIATION] Created Signal ${signal.signal_id} for incident ${incident.incident_id}`);
    }
    // Test/mock database methods
    addSignal(signal) {
        this.signalDatabase.set(signal.signal_id, signal);
    }
    addAirtableRecord(record) {
        this.airtableRecords.set(record.id, record);
    }
    getSignal(signalId) {
        return this.signalDatabase.get(signalId);
    }
    listSignals() {
        return Array.from(this.signalDatabase.values());
    }
}
exports.ReconciliationEngine = ReconciliationEngine;
//# sourceMappingURL=reconciliation.js.map