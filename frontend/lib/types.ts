export interface Supervisor {
    id: string;
    name: string;
    base_instruction: string;
    available_actions: string[];
    wakeup_interval_seconds: number | null;
    wakeup_aggressiveness: string;
    model: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface Run {
    id: string;
    supervisor_id: string;
    order_id: string;
    order_context: Record<string, unknown>;
    temporal_workflow_id: string | null;
    temporal_run_id: string | null;
    status: string;
    extra_instructions: string[];
    memory_summary: string | null;
    next_wakeup_at: string | null;
    wakeup_guidance: string | null;
    final_summary: string | null;
    final_actions_taken: string[] | null;
    final_learnings: string | null;
    final_recommendations: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
  }
  
  export interface Activity {
    id: string;
    run_id: string;
    activity_type: string;
    title: string;
    detail: string | null;
    payload: Record<string, unknown> | null;
    created_at: string;
  }