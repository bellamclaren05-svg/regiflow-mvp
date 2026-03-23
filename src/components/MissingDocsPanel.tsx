import { useMemo, useState } from "react";

type DocRow = {
  document_type: string | null;
};

function getRequiredDocs(matter: any) {
  const required = new Set<string>();

  // Purchase rules
  if (matter.transaction_type === "purchase") {
    required.add("TR1");
    required.add("Completion Statement");
  }

  // Leasehold rules (freehold = false, so this block won't run)
  if (matter.is_leasehold) {
    required.add("Notice of Transfer");
    required.add("Certificate");
  }

  // Mortgage rules
  if (matter.has_mortgage) {
    required.add("Mortgage Deed");
  }

  return Array.from(required);
}

export default function MissingDocsPanel({
  matter,
  docs,
}: {
  matter: any;
  docs: DocRow[];
}) {
  const [creating, setCreating] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const required = useMemo(() => getRequiredDocs(matter), [matter]);

  const uploadedTypes = useMemo(() => {
    const s = new Set<string>();
    docs.forEach((d) => {
      if (d.document_type) s.add(d.document_type);
    });
    return s;
  }, [docs]);

  const missing = useMemo(
    () => required.filter((t) => !uploadedTypes.has(t)),
    [required, uploadedTypes]
  );

  // OPTION B labels (recommended)
  const taskLabels = useMemo(() => {
    return missing.map((t) => `Missing doc: ${t}`);
  }, [missing]);

  async function createTasks() {
    if (!matter?.id) return;
    if (taskLabels.length === 0) return;

    setCreating(true);
    setResultMsg("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matterId: matter.id,
          labels: taskLabels,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to create tasks");

      setResultMsg(`Created ${data.created} task(s), skipped ${data.skipped} duplicate(s).`);
    } catch (e: any) {
      setResultMsg(e?.message || "Failed to create tasks");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12, marginTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Required documents</div>

      {required.length === 0 ? (
        <div style={{ fontSize: 14, color: "#666" }}>
          Set transaction type / leasehold / mortgage to generate required docs.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {required.map((t) => (
              <div key={t} style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14 }}>{t}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {uploadedTypes.has(t) ? "✅ present" : "❌ missing"}
                </div>
              </div>
            ))}
          </div>

          {missing.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 14, color: "#444" }}>
              Missing: <strong>{missing.join(", ")}</strong>
            </div>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={createTasks}
              disabled={creating || taskLabels.length === 0}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            >
              {creating ? "Creating..." : "Create tasks for missing docs"}
            </button>

            {resultMsg && <span style={{ fontSize: 14, color: "#444" }}>{resultMsg}</span>}
          </div>
        </>
      )}
    </div>
  );
}
