// src/components/MatterTasksPanel.tsx
import useSWR from "swr";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type TaskRow = {
  id: string;
  matter_id: string;
  label: string;
  completed: boolean;
  created_at: string;
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconDoc = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 2h6l3 3v7a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"
      stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 2v3h3M4 7h5M4 9.5h3" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconTask = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M4 6.5l2 2 3-3" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTaskDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return "";
  }
}

function stripPrefix(label: string) {
  return label.startsWith("Missing doc: ")
    ? label.replace("Missing doc: ", "")
    : label;
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onToggle,
  accent,
}: {
  task: TaskRow;
  onToggle: (id: string, completed: boolean) => void;
  accent?: boolean;
}) {
  const done = !!task.completed;

  return (
    <label style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "10px 14px",
      borderRadius: 8,
      border: `1px solid ${done ? "var(--border)" : accent ? "rgba(59,79,216,0.18)" : "var(--border)"}`,
      background: done ? "#FAFBFF" : "var(--bg-card)",
      cursor: "pointer",
      transition: "background 0.12s, border-color 0.12s",
    }}>
      {/* Checkbox + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>

        {/* Custom checkbox */}
        <div
          onClick={() => onToggle(task.id, !done)}
          style={{
            width: 17, height: 17,
            borderRadius: 4,
            border: `1.5px solid ${done ? "var(--accent)" : "var(--border-strong)"}`,
            background: done ? "var(--accent)" : "transparent",
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s, border-color 0.15s",
          }}
        >
          {done && <IconCheck />}
        </div>

        <span style={{
          fontSize: 13,
          color: done ? "var(--text-muted)" : "var(--text-primary)",
          textDecoration: done ? "line-through" : "none",
          textDecorationColor: "var(--text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {stripPrefix(task.label)}
        </span>
      </div>

      {/* Date */}
      <span style={{
        fontSize: 11, color: "var(--text-muted)",
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {formatTaskDate(task.created_at)}
      </span>
    </label>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function TaskSection({
  title,
  icon,
  tasks,
  emptyText,
  onToggle,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  tasks: TaskRow[];
  emptyText: string;
  onToggle: (id: string, completed: boolean) => void;
  accent?: boolean;
}) {
  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <div>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 500,
          color: "var(--text-secondary)",
        }}>
          <span style={{ color: accent ? "var(--accent-text)" : "var(--text-muted)" }}>
            {icon}
          </span>
          {title}
        </div>

        {tasks.length > 0 && (
          <span style={{
            fontSize: 11, color: "var(--text-muted)",
            background: "#F1F3F9",
            padding: "1px 7px", borderRadius: 20,
          }}>
            {doneCount}/{tasks.length}
          </span>
        )}
      </div>

      {/* Task list or empty */}
      {tasks.length === 0 ? (
        <div style={{
          fontSize: 12.5, color: "var(--text-muted)",
          padding: "10px 14px",
          background: "#FAFBFF",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={onToggle} accent={accent} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MatterTasksPanel({ matterId }: { matterId: string }) {
  const { data: tasks, mutate } = useSWR<TaskRow[]>(
    matterId ? `/api/tasks-by-matter?matterId=${matterId}` : null,
    fetcher
  );

  // Listen for tasks-updated events (unchanged logic)
  useEffect(() => {
    function onTasksUpdated() { mutate(); }
    window.addEventListener("tasks-updated", onTasksUpdated);
    return () => window.removeEventListener("tasks-updated", onTasksUpdated);
  }, [mutate]);

  const missingDocTasks = (tasks ?? []).filter((t) =>
    t.label?.startsWith("Missing doc:")
  );
  const otherTasks = (tasks ?? []).filter(
    (t) => !t.label?.startsWith("Missing doc:")
  );

  // Optimistic toggle (unchanged logic)
  async function toggleTask(taskId: string, completed: boolean) {
    const current = tasks ?? [];
    mutate(
      current.map((t) => (t.id === taskId ? { ...t, completed } : t)),
      false
    );
    const res = await fetch("/api/tasks-by-matter", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, completed }),
    });
    if (!res.ok) {
      await mutate();
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Failed to update task");
      return;
    }
    await mutate();
  }

  // Overall progress bar
  const total     = (tasks ?? []).length;
  const done      = (tasks ?? []).filter((t) => t.completed).length;
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "18px 20px",
      marginBottom: 14,
    }}>

      {/* ── Panel header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 14,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            Tasks
          </div>
          {total > 0 && (
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
              {done} of {total} complete
            </div>
          )}
        </div>

        {/* Progress pill */}
        {total > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 500,
            padding: "2px 9px", borderRadius: 20,
            background: pct === 100 ? "var(--success-soft)" : "var(--accent-soft)",
            color: pct === 100 ? "var(--success)" : "var(--accent-text)",
          }}>
            {pct}%
          </span>
        )}
      </div>

      {/* ── Progress bar ── */}
      {total > 0 && (
        <div style={{
          height: 3, borderRadius: 2,
          background: "var(--border)",
          marginBottom: 18, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${pct}%`,
            background: pct === 100 ? "var(--success)" : "var(--accent)",
            transition: "width 0.4s ease",
          }} />
        </div>
      )}

      {/* ── Sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <TaskSection
          title="Document tasks"
          icon={<IconDoc />}
          tasks={missingDocTasks}
          emptyText="No missing-doc tasks yet. Use the panel below to create them."
          onToggle={toggleTask}
          accent
        />
        <TaskSection
          title="Other tasks"
          icon={<IconTask />}
          tasks={otherTasks}
          emptyText="No other tasks yet."
          onToggle={toggleTask}
        />
      </div>
    </div>
  );
}