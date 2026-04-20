// src/components/MissingDocsPanel.tsx
import { useMemo, useState } from "react";

type DocRow = {
  document_type: string | null;
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconPresent = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" fill="var(--success-soft)"
      stroke="var(--success)" strokeWidth="1.2"/>
    <path d="M4 6.5l2 2 3-3" stroke="var(--success)"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconMissing = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" fill="var(--danger-soft)"
      stroke="var(--danger)" strokeWidth="1.2"/>
    <path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="var(--danger)"
      strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconWand = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 11L8 5M8 5l1-3 1 2 2 1-3 1z" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9l.5.5M11.5 7.5l.5.5M9.5 10.5l.5.5"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconInfo = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M6.5 6v3.5M6.5 4v.5" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

// ── Rules (unchanged logic) ───────────────────────────────────────────────────

function getRequiredDocs(matter: any) {
  const required = new Set<string>();
  if (matter.transaction_type === "purchase") {
    required.add("TR1");
    required.add("Completion Statement");
  }
  if (matter.is_leasehold) {
    required.add("Notice of Transfer");
    required.add("Certificate");
  }
  if (matter.has_mortgage) {
    required.add("Mortgage Deed");
  }
  return Array.from(required);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MissingDocsPanel({
  matter,
  docs,
}: {
  matter: any;
  docs: DocRow[];
}) {
  const [creating, setCreating]   = useState(false);
  const [resultMsg, setResultMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const required = useMemo(() => getRequiredDocs(matter), [matter]);

  const uploadedTypes = useMemo(() => {
    const s = new Set<string>();
    docs.forEach((d) => { if (d.document_type) s.add(d.document_type); });
    return s;
  }, [docs]);

  const missing = useMemo(
    () => required.filter((t) => !uploadedTypes.has(t)),
    [required, uploadedTypes]
  );

  const taskLabels = useMemo(
    () => missing.map((t) => `Missing doc: ${t}`),
    [missing]
  );

  // Dispatch tasks-updated so TasksPanel refreshes instantly (unchanged logic)
  async function createTasks() {
    if (!matter?.id || taskLabels.length === 0) return;
    setCreating(true);
    setResultMsg(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterId: matter.id, labels: taskLabels }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to create tasks");
      window.dispatchEvent(new Event("tasks-updated"));
      setResultMsg({
        text: `${data.created} task(s) created, ${data.skipped} duplicate(s) skipped.`,
        ok: true,
      });
    } catch (e: any) {
      setResultMsg({ text: e?.message || "Failed to create tasks", ok: false });
    } finally {
      setCreating(false);
    }
  }

  const allPresent = required.length > 0 && missing.length === 0;

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "18px 20px",
      marginBottom: 14,
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 14,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            Required Documents
          </div>
          {required.length > 0 && (
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
              {required.length - missing.length} of {required.length} present
            </div>
          )}
        </div>

        {/* All-clear badge */}
        {allPresent && (
          <span style={{
            fontSize: 11, fontWeight: 500,
            padding: "2px 9px", borderRadius: 20,
            background: "var(--success-soft)", color: "var(--success)",
          }}>
            All present
          </span>
        )}

        {/* Missing count badge */}
        {missing.length > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 500,
            padding: "2px 9px", borderRadius: 20,
            background: "var(--danger-soft)", color: "var(--danger)",
          }}>
            {missing.length} missing
          </span>
        )}
      </div>

      {/* ── No flags set ── */}
      {required.length === 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px",
          background: "#FAFBFF",
          border: "1px solid var(--border)",
          borderRadius: 8,
          fontSize: 12.5, color: "var(--text-muted)",
        }}>
          <IconInfo />
          Set transaction type, leasehold, or mortgage flags above to see required documents.
        </div>
      )}

      {/* ── Doc rows ── */}
      {required.length > 0 && (
        <>
          {/* Progress bar */}
          <div style={{
            height: 3, borderRadius: 2,
            background: "var(--border)",
            marginBottom: 14, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${Math.round(((required.length - missing.length) / required.length) * 100)}%`,
              background: allPresent ? "var(--success)" : "var(--accent)",
              transition: "width 0.4s ease",
            }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {required.map((docType) => {
              const present = uploadedTypes.has(docType);
              return (
                <div key={docType} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 14px",
                  borderRadius: 8,
                  border: `1px solid ${present
                    ? "rgba(22,163,74,0.15)"
                    : "rgba(220,38,38,0.15)"}`,
                  background: present ? "var(--success-soft)" : "var(--danger-soft)",
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: present ? "var(--success)" : "var(--danger)",
                  }}>
                    {docType}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {present ? <IconPresent /> : <IconMissing />}
                    <span style={{
                      fontSize: 11.5, fontWeight: 500,
                      color: present ? "var(--success)" : "var(--danger)",
                    }}>
                      {present ? "Present" : "Missing"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Create tasks button ── */}
          {missing.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={createTasks}
                disabled={creating}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px",
                  background: creating ? "var(--border)" : "var(--accent)",
                  color: creating ? "var(--text-muted)" : "#fff",
                  border: "none", borderRadius: 8,
                  fontFamily: "var(--font)", fontSize: 13, fontWeight: 500,
                  cursor: creating ? "not-allowed" : "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                <IconWand />
                {creating ? "Creating…" : `Create ${missing.length} task(s) for missing docs`}
              </button>

              {resultMsg && (
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: resultMsg.ok ? "var(--success)" : "var(--danger)",
                }}>
                  {resultMsg.ok ? "✓ " : "✕ "}{resultMsg.text}
                </span>
              )}
            </div>
          )}

          {/* All clear state — no button needed */}
          {allPresent && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px",
              background: "var(--success-soft)",
              border: "1px solid rgba(22,163,74,0.2)",
              borderRadius: 8,
              fontSize: 12.5, color: "var(--success)", fontWeight: 500,
            }}>
              <IconPresent />
              All required documents uploaded — no tasks needed.
            </div>
          )}
        </>
      )}
    </div>
  );
}