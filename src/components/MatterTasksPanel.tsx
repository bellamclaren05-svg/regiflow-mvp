import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type TaskRow = {
  id: string;
  matter_id: string;
  label: string;
  completed: boolean;
  created_at: string;
};

export default function MatterTasksPanel({ matterId }: { matterId: string }) {
  const { data: tasks, mutate } = useSWR<TaskRow[]>(
    matterId ? `/api/tasks-by-matter?matterId=${matterId}` : null,
    fetcher
  );

  const missingDocTasks = (tasks ?? []).filter((t) => t.label?.startsWith("Missing doc:"));
  const otherTasks = (tasks ?? []).filter((t) => !t.label?.startsWith("Missing doc:"));

  async function toggleTask(taskId: string, completed: boolean) {
    // Optimistic UI update
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
      // rollback if patch fails
      await mutate();
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Failed to update task");
      return;
    }

    // revalidate
    await mutate();
  }

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h2>Tasks</h2>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Missing document tasks</div>

        {missingDocTasks.length === 0 ? (
          <div style={{ fontSize: 14, color: "#666" }}>No missing-doc tasks yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {missingDocTasks.map((t) => (
              <label
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  border: "1px solid #eee",
                  borderRadius: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={!!t.completed}
                    onChange={(e) => toggleTask(t.id, e.target.checked)}
                  />
                  <span style={{ fontSize: 14, textDecoration: t.completed ? "line-through" : "none" }}>
                    {t.label}
                  </span>
                </div>

                <span style={{ fontSize: 12, color: "#777" }}>
                  {new Date(t.created_at).toLocaleString()}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Other tasks</div>

        {otherTasks.length === 0 ? (
          <div style={{ fontSize: 14, color: "#666" }}>No other tasks yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {otherTasks.map((t) => (
              <label
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  border: "1px solid #eee",
                  borderRadius: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={!!t.completed}
                    onChange={(e) => toggleTask(t.id, e.target.checked)}
                  />
                  <span style={{ fontSize: 14, textDecoration: t.completed ? "line-through" : "none" }}>
                    {t.label}
                  </span>
                </div>

                <span style={{ fontSize: 12, color: "#777" }}>
                  {new Date(t.created_at).toLocaleString()}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
``