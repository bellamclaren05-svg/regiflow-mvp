export interface Matter {
  id: string;
  title: string;
  reference?: string | null;
  completion_date?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  matter_id: string;
  label: string;
  completed: boolean;
  created_at: string;
}

export interface Requisition {
  id: string;
  matter_id: string;
  description: string;
  raised_by?: string | null;
  resolved: boolean;
  created_at: string;
}

export interface EventLog {
  id: string;
  matter_id?: string | null;
  event_type: string;
  payload?: Record<string, unknown> | null;
  created_at: string;
}
