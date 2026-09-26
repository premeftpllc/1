/**
 * PremeOS Control Plane - Type Definitions
 * Shared types and interfaces across all 4 components
 */
export declare enum IncidentState {
    RECEIVED = "RECEIVED",
    TRIAGED = "TRIAGED",
    DIAGNOSING = "DIAGNOSING",
    AWAITING_APPROVAL = "AWAITING_APPROVAL",
    EXECUTING = "EXECUTING",
    VERIFYING = "VERIFYING",
    RECONCILING = "RECONCILING",
    CLOSED = "CLOSED",
    BLOCKED = "BLOCKED",
    ESCALATED = "ESCALATED"
}
export declare enum ErrorSignature {
    OUTPUT_EXHAUSTION = "output_exhaustion",
    OPERATOR_ERROR = "operator_error",
    DOWNSTREAM_WRITE_REJECTION = "downstream_write_rejection",
    LLM_SAFETY_FILTER = "llm_safety_filter",
    LLM_GENERATION_FAILURE = "llm_generation_failure",
    DOWNSTREAM_RATE_LIMIT = "downstream_rate_limit",
    DOWNSTREAM_AUTH_FAILURE = "downstream_auth_failure",
    MAPPER_SYNTAX_ERROR = "mapper_syntax_error",
    NULL_REFERENCE = "null_reference",
    TYPE_ERROR_TRANSFORM = "type_error_transform",
    UNKNOWN_ERROR = "unknown_error"
}
export declare enum Severity {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare enum Confidence {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare enum AuthorizationLevel {
    AUTOMATIC = "AUTOMATIC",
    OWNER_APPROVAL = "OWNER_APPROVAL",
    MANUAL_REVIEW = "MANUAL_REVIEW"
}
export declare enum VerificationResult {
    PASS = "PASS",
    FAIL = "FAIL"
}
export declare enum TerminalStatus {
    CLOSED_SUCCESS = "CLOSED_SUCCESS",
    BLOCKED_DUPLICATE = "BLOCKED_DUPLICATE",
    BLOCKED_MALFORMED_WRITE = "BLOCKED_MALFORMED_WRITE",
    BLOCKED_MALFORMED_AND_DUPLICATE = "BLOCKED_MALFORMED_AND_DUPLICATE"
}
export declare enum RiskLevel {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export interface RawErrorPayload {
    error_name: string;
    error_message: string;
    cause_module_id: string;
    cause_module_type: string;
    stack_trace?: string;
}
export interface ModuleIO {
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
    skipped?: boolean;
    reason?: string;
}
export interface PerModuleIO {
    [moduleId: string]: ModuleIO;
}
export interface Incident {
    incident_id: string;
    received_timestamp: string;
    scenario_id: number;
    blueprint_hash: string;
    airtable_event_key: string;
    raw_error_payload: RawErrorPayload;
    per_module_io: PerModuleIO;
    state: IncidentState;
    lifecycle_log: LifecycleEvent[];
    diagnosis?: Diagnosis;
    repair_proposal?: RepairProposal;
    verification_result?: VerificationResult;
    reconciliation_status?: ReconciliationResult;
}
export interface LifecycleEvent {
    event: IncidentState;
    timestamp: string;
    component: string;
    data?: Record<string, any>;
}
export interface AffectedField {
    module_path: string;
    current_type: string;
    expected_type: string;
    current_value?: any;
    expected_value?: any;
}
export interface RemediationSuggestion {
    priority: "HIGH" | "MEDIUM" | "LOW";
    action: string;
    description: string;
    expected_outcome: string;
}
export interface Diagnosis {
    incident_id: string;
    diagnosed_timestamp: string;
    diagnosis_text: string;
    root_cause_category: ErrorSignature;
    severity: Severity;
    confidence: Confidence;
    affected_fields: AffectedField[];
    remediation_suggestions: RemediationSuggestion[];
    error_signature: ErrorSignature;
    evidence_sources: {
        raw_error_payload: boolean;
        per_module_io: boolean;
        blueprint_configuration: boolean;
    };
    escalation_required?: boolean;
    manual_review_required?: boolean;
    incomplete_analysis?: boolean;
}
export interface PrerequisiteCheck {
    check_id: string;
    description: string;
    validation_rule: string;
    fail_behavior: "ESCALATE" | "SKIP";
}
export interface RepairStep {
    step_num: number;
    description: string;
    action_type: string;
    parameters: Record<string, any>;
    expected_result: string;
}
export interface RollbackStep {
    step_num: number;
    description: string;
    action_type: string;
    parameters?: Record<string, any>;
}
export interface SuccessCriterion {
    criterion_id: string;
    description: string;
    verification_check: {
        type: string;
        module_id?: string;
        assertion: string;
    };
}
export interface Risk {
    risk_id: string;
    description: string;
    mitigation: string;
}
export interface RiskAnalysis {
    risks: Risk[];
    blast_radius: string;
}
export interface RepairPlaybook {
    playbook_id: string;
    playbook_name: string;
    description: string;
    error_signatures: ErrorSignature[];
    prerequisite_checks: PrerequisiteCheck[];
    execution_context: {
        platform: string;
        scenario_id?: number;
        module_id?: string;
        module_type?: string;
    };
    repair_steps: RepairStep[];
    rollback_procedure: RollbackStep[];
    success_criteria: SuccessCriterion[];
    risk_level: RiskLevel;
    risk_analysis: RiskAnalysis;
    applicability_score: number;
    created_by: string;
    created_date: string;
    last_tested?: string;
    test_success_rate?: number;
    metadata?: {
        tags: string[];
        related_incidents: string[];
        documentation_url?: string;
    };
}
export interface RiskAssessment {
    risk_level: RiskLevel;
    risks: Risk[];
    blast_radius: string;
    rollback_possible: boolean;
    rollback_procedure?: RollbackStep[];
}
export interface RepairProposal {
    incident_id: string;
    selected_timestamp: string;
    playbook_id: string;
    playbook_name: string;
    repair_steps: RepairStep[];
    expected_outcome: string;
    risk_assessment: RiskAssessment;
    authorization_level: AuthorizationLevel;
    execution_context: Record<string, any>;
    success_criteria: SuccessCriterion[];
    escalation_required?: boolean;
    escalation_reason?: string;
}
export interface VerificationCheck {
    check_name: string;
    result: VerificationResult;
    evidence: Record<string, any>;
}
export interface VerificationOutput {
    incident_id: string;
    verification_timestamp: string;
    verification_result: VerificationResult;
    verification_checks_performed: VerificationCheck[];
    inspection_timestamp: string;
    regression_detected: boolean;
    next_state: IncidentState;
    failure_reason?: string;
}
export interface MalformedWriteCheck {
    result: "PASSED" | "FAILED";
    affected_fields: AffectedField[];
    validation_errors: Array<{
        field_name: string;
        error_type: string;
        [key: string]: any;
    }>;
    records_validated: number;
    evidence?: Record<string, any>;
}
export interface DuplicateCheck {
    result: "PASSED" | "FAILED";
    is_duplicate: boolean;
    pre_existing_signal_id?: string;
    prevented_duplicate_creation: boolean;
    evidence?: Record<string, any>;
}
export interface ReconciliationResult {
    incident_id: string;
    reconciled_timestamp: string;
    reconciliation_result: "PASSED" | "FAILED";
    malformed_write_check: MalformedWriteCheck;
    duplicate_check: DuplicateCheck;
    terminal_status: TerminalStatus;
    completion_timestamp: string;
    next_state: IncidentState;
}
export interface SignalRecord {
    signal_id: string;
    airtable_event_key: string;
    created_at: string;
    incident_id_reference?: string;
    status: string;
    lifecycle_state: IncidentState;
}
export interface AirtableRecord {
    id: string;
    table_id: string;
    fields: Record<string, any>;
    createdTime?: string;
}
export interface AirtableFieldSchema {
    id: string;
    name: string;
    type: string;
    max_length?: number;
    is_required?: boolean;
    [key: string]: any;
}
export interface AirtableTableSchema {
    table_id: string;
    name: string;
    fields: AirtableFieldSchema[];
}
export interface MakeExecutionResponse {
    id: string;
    scenarioId: number;
    status: number;
    per_module_io?: PerModuleIO;
    dlqCount?: number;
    completion_timestamp?: string;
    [key: string]: any;
}
export interface MakeScenarioBlueprint {
    id: number;
    name: string;
    modules: Array<{
        id: string;
        type: string;
        name: string;
        [key: string]: any;
    }>;
    [key: string]: any;
}
export declare class IncidentProcessingError extends Error {
    code: string;
    component: string;
    escalation_required: boolean;
    constructor(code: string, component: string, escalation_required?: boolean, message?: string);
}
export declare class RetryableError extends IncidentProcessingError {
    constructor(code: string, component: string, message?: string);
}
export declare class EscalationError extends IncidentProcessingError {
    constructor(code: string, component: string, message?: string);
}
//# sourceMappingURL=index.d.ts.map