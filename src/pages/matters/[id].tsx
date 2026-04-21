// src/pages/matters/[id].tsx
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { Matter } from "@/lib/types";
import SDLTCountdown from "@/components/SDLTCountdown";
import AP1Checklist from "@/components/AP1Checklist";
import RequisitionList from "@/components/RequisitionList";
import MatterDocumentUpload from "@/components/MatterDocumentUpload";
import MissingDocsPanel from "@/components/MissingDocsPanel";
import MatterTasksPanel from "@/components/MatterTasksPanel";
import { formatDate, sdltDaysRemaining } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconSave = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 2h7.5L11 3.5V11a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"
      stroke="currentColor" strokeWidth="1.3"/>
    <path d="M4 1v3h5V1M4 7h5" stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round"/>
  </svg>
);

const IconTasks = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconAP1 = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 2h6l3 3v7a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"
      stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 2v3h3M4 7h5M4 9.5h3" stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round"/>
  </svg>
);

const IconDoc = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 2h6l3 3v7a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"
      stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconFlag = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 1.5v10M2 2.5h8L8 6l2 3.5H2" stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M6.5 4v3l2 1.5" stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round"/>
  </svg>
);

// ── Small helpers ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const cfg =
    s === "active"   ? { bg: "var(--accent-soft)",  text: "var(--accent-text)" } :
    s === "complete" ? { bg: "var(--success-soft)",  text: "var(--success)" }    :
    s === "pending"  ? { bg: "var(--warning-soft)",  text: "var(--warning)" }    :
                       { bg: "#F1F3F9",              text: "var(--text-secondary)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: cfg.bg, color: cfg.text,
    }}>
      {status}
    </span>
  );
}

function SdltBadge({ completionDate }: { completionDate: string | null | undefined }) {
  const days = sdltDaysRemaining(completionDate);
  if (days === null) return null;
  const overdue = days < 0;
  const urgent  = days >= 0 && days <= 3;
  const cfg = overdue
    ? { bg: "var(--danger-soft)",  text: "var(--danger)",  label: `${Math.abs(days)}d overdue` }
    : urgent
    ? { bg: "var(--warning-soft)", text: "var(--warning)", label: `${days}d left` }
    : { bg: "var(--success-soft)", text: "var(--success)", label: `${days}d left` };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: cfg.bg, color: cfg.text,
    }}>
      <IconClock /> SDLT {cfg.label}
    </span>
  );
}

function CardShell({ children, style = {} }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "16px 18px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      fontSize: 12, fontWeight: 500,
      color: "var(--text-secondary)",
      marginBottom: 14,
      paddingBottom: 10,
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      {title}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
      alignItems: "baseline", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 11.5, color: "var(--text-muted)", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        fontSize: 12.5, color: "var(--text-primary)", fontWeight: 500,
        fontFamily: mono ? "var(--font-mono)" : "var(--font)",
        textAlign: "right",
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MatterDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: matter,
    error,
    isLoading,
    mutate: mutateMatter,
  } = useSWR<Matter>(id ? `/api/matters?id=${id}` : null, fetcher);

  const { data: docs, mutate: mutateDocs } = useSWR<any[]>(
    matter?.id ? `/api/documents?matterId=${matter.id}` : null,
    fetcher
  );

  const [savingFlags, setSavingFlags]         = useState(false);
  const [flagsSaved, setFlagsSaved]           = useState(false);
  const [creatingTasks, setCreatingTasks]     = useState(false);
  const [tasksMsg, setTasksMsg]               = useState<{ text: string; ok: boolean } | null>(null);
  const [generatingAP1, setGeneratingAP1]     = useState(false);
  const [transactionType, setTransactionType] = useState<string>("");
  const [isLeasehold, setIsLeasehold]         = useState<boolean>(false);
  const [hasMortgage, setHasMortgage]         = useState<boolean>(false);

  useEffect(() => {
    if (!matter) return;
    setTransactionType(((matter as any).transaction_type ?? "") as string);
    setIsLeasehold(!!(matter as any).is_leasehold);
    setHasMortgage(!!(matter as any).has_mortgage);
  }, [matter?.id]);

  useEffect(() => {
    function onDocsUpdated() { mutateDocs(); }
    window.addEventListener("docs-updated", onDocsUpdated);
    return () => window.removeEventListener("docs-updated", onDocsUpdated);
  }, [mutateDocs]);

  // Required docs logic (mirrors MissingDocsPanel)
  function getRequiredDocs() {
    const required = new Set<string>();
    if (transactionType === "purchase") {
      required.add("TR1");
      required.add("Completion Statement");
    }
    if (isLeasehold) {
      required.add("Notice of Transfer");
      required.add("Certificate");
    }
    if (hasMortgage) {
      required.add("Mortgage Deed");
    }
    return Array.from(required);
  }

  const uploadedTypes = new Set(
    (docs ?? []).map((d: any) => d.document_type).filter(Boolean)
  );
  const requiredDocs  = getRequiredDocs();
  const missingDocs   = requiredDocs.filter((t) => !uploadedTypes.has(t));

  async function saveMatterFlags() {
    if (!matter?.id) return;
    setSavingFlags(true);
    setFlagsSaved(false);
    try {
      const res = await fetch("/api/matters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: matter.id,
          transaction_type: transactionType || null,
          is_leasehold: isLeasehold,
          has_mortgage: hasMortgage,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ? JSON.stringify(data.error) : "Failed to save flags");
      }
      await mutateMatter();
      setFlagsSaved(true);
      setTimeout(() => setFlagsSaved(false), 2500);
    } catch (e: any) {
      alert(e?.message || "Failed to save flags");
    } finally {
      setSavingFlags(false);
    }
  }

  async function createMissingDocTasks() {
    if (!matter?.id || missingDocs.length === 0) return;
    setCreatingTasks(true);
    setTasksMsg(null);
    try {
      const labels = missingDocs.map((t) => `Missing doc: ${t}`);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterId: matter.id, labels }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to create tasks");
      window.dispatchEvent(new Event("tasks-updated"));
      setTasksMsg({ text: `${data.created} task(s) created`, ok: true });
      setTimeout(() => setTasksMsg(null), 3000);
    } catch (e: any) {
      setTasksMsg({ text: e?.message || "Failed", ok: false });
    } finally {
      setCreatingTasks(false);
    }
  }

  function generateAP1() {
    setGeneratingAP1(true);
    setTimeout(() => {
      setGeneratingAP1(false);
      alert("AP1 generation coming soon — this will be wired to your AP1 template logic.");
    }, 800);
  }

  // ── Loading / error ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "40px 0" }}>
        Loading matter…
      </div>
    );
  }

  if (error || !matter || (matter as any).error) {
    return (
      <div style={{ padding: "40px 0" }}>
        <div style={{ fontSize: 13, color: "var(--danger)", marginBottom: 12 }}>
          Matter not found or failed to load.
        </div>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "var(--accent-text)", textDecoration: "none",
        }}>
          <IconArrowLeft /> Back to Matters
        </Link>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>

      {/* ── Back link ── */}
      <Link href="/" style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none",
        marginBottom: 14,
      }}>
        <IconArrowLeft /> All Matters
      </Link>

      {/* ── Page header ── */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "18px 22px",
        marginBottom: 16,
      }}>
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 16,
          flexWrap: "wrap",
        }}>
          {/* Title block */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{
                fontSize: 20, fontWeight: 600, letterSpacing: "-0.3px",
                color: "var(--text-primary)", margin: 0,
              }}>
                {matter.reference
                  ? `${matter.reference} — ${matter.title}`
                  : matter.title}
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <StatusBadge status={matter.status} />
              <SdltBadge completionDate={matter.completion_date} />
              {transactionType && (
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "3px 10px", borderRadius: 20,
                  fontSize: 11, fontWeight: 500,
                  background: transactionType === "purchase" ? "var(--accent-soft)" : "#FFF7ED",
                  color: transactionType === "purchase" ? "var(--accent-text)" : "#92400E",
                }}>
                  {transactionType === "purchase" ? "Purchase" : "Sale"}
                </span>
              )}
              {isLeasehold && (
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "3px 10px", borderRadius: 20,
                  fontSize: 11, fontWeight: 500,
                  background: "var(--success-soft)", color: "var(--success)",
                }}>
                  Leasehold
                </span>
              )}
              {hasMortgage && (
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "3px 10px", borderRadius: 20,
                  fontSize: 11, fontWeight: 500,
                  background: "var(--warning-soft)", color: "var(--warning)",
                }}>
                  Mortgage
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

            {/* Save flags */}
            <button
              onClick={saveMatterFlags}
              disabled={savingFlags}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px",
                background: "var(--bg-page)",
                color: flagsSaved ? "var(--success)" : "var(--text-secondary)",
                border: `1px solid ${flagsSaved ? "rgba(22,163,74,0.3)" : "var(--border-strong)"}`,
                borderRadius: 8, fontFamily: "var(--font)",
                fontSize: 12.5, fontWeight: 500,
                cursor: savingFlags ? "not-allowed" : "pointer",
              }}
            >
              <IconSave />
              {savingFlags ? "Saving…" : flagsSaved ? "Saved ✓" : "Save flags"}
            </button>

            {/* Create tasks */}
            <button
              onClick={createMissingDocTasks}
              disabled={creatingTasks || missingDocs.length === 0}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px",
                background: "var(--bg-page)",
                color: missingDocs.length === 0 ? "var(--text-muted)" : "var(--text-secondary)",
                border: "1px solid var(--border-strong)",
                borderRadius: 8, fontFamily: "var(--font)",
                fontSize: 12.5, fontWeight: 500,
                cursor: (creatingTasks || missingDocs.length === 0) ? "not-allowed" : "pointer",
                opacity: missingDocs.length === 0 ? 0.5 : 1,
              }}
            >
              <IconTasks />
              {creatingTasks
                ? "Creating…"
                : missingDocs.length === 0
                ? "No missing docs"
                : `Create ${missingDocs.length} task(s)`}
            </button>

            {/* Generate AP1 */}
            <button
              onClick={generateAP1}
              disabled={generatingAP1}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px",
                background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: 8,
                fontFamily: "var(--font)", fontSize: 12.5, fontWeight: 500,
                cursor: generatingAP1 ? "not-allowed" : "pointer",
                opacity: generatingAP1 ? 0.7 : 1,
              }}
            >
              <IconAP1 />
              {generatingAP1 ? "Generating…" : "Generate AP1"}
            </button>
          </div>
        </div>

        {/* Task result message */}
        {tasksMsg && (
          <div style={{
            marginTop: 10, fontSize: 12, fontWeight: 500,
            color: tasksMsg.ok ? "var(--success)" : "var(--danger)",
          }}>
            {tasksMsg.ok ? "✓" : "✕"} {tasksMsg.text}
          </div>
        )}
      </div>

      {/* ── 2-col grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 14,
      }}>

        {/* TOP LEFT — Matter overview */}
        <CardShell>
          <CardTitle icon={<IconFlag />} title="Matter Overview" />
          <InfoRow label="Reference"       value={matter.reference ?? "—"} mono />
          <InfoRow label="Status"          value={matter.status} />
          <InfoRow label="Completion date" value={formatDate(matter.completion_date)} />
          <InfoRow label="Created"         value={formatDate(matter.created_at)} />
          {transactionType && (
            <InfoRow label="Transaction"   value={transactionType === "purchase" ? "Purchase" : "Sale"} />
          )}
          <div style={{ marginTop: 14 }}>
            <SDLTCountdown completionDate={matter.completion_date} />
          </div>
        </CardShell>

        {/* TOP RIGHT — Documents */}
        <CardShell>
          <CardTitle icon={<IconDoc />} title="Documents" />

          {/* Required docs status */}
          {requiredDocs.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {requiredDocs.map((docType) => {
                const present = uploadedTypes.has(docType);
                return (
                  <div key={docType} style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px", borderRadius: 7,
                    marginBottom: 5,
                    background: present ? "var(--success-soft)" : "var(--danger-soft)",
                    border: `1px solid ${present ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)"}`,
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500,
                      color: present ? "var(--success)" : "var(--danger)" }}>
                      {docType}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 500,
                      color: present ? "var(--success)" : "var(--danger)" }}>
                      {present ? "✓ Present" : "✕ Missing"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload widget */}
          <MatterDocumentUpload matterId={matter.id} />
        </CardShell>

        {/* BOTTOM LEFT — Tasks */}
        <CardShell>
          <CardTitle icon={<IconTasks />} title="Tasks" />
          <MatterTasksPanel matterId={matter.id} />
        </CardShell>

        {/* BOTTOM RIGHT — Matter Flags */}
        <CardShell>
          <CardTitle icon={<IconFlag />} title="Matter Flags" />

          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 500,
              color: "var(--text-secondary)", marginBottom: 5,
            }}>
              Transaction type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", fontSize: 13,
                fontFamily: "var(--font)", color: "var(--text-primary)",
                background: "var(--bg-card)", border: "1px solid var(--border-strong)",
                borderRadius: 8, outline: "none", cursor: "pointer",
              }}
            >
              <option value="">Select…</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 9,
              cursor: "pointer", fontSize: 13, color: "var(--text-secondary)",
            }}>
              <input
                type="checkbox"
                checked={isLeasehold}
                onChange={(e) => setIsLeasehold(e.target.checked)}
                style={{ margin: 0 }}
              />
              Leasehold
            </label>
            <label style={{
              display: "flex", alignItems: "center", gap: 9,
              cursor: "pointer", fontSize: 13, color: "var(--text-secondary)",
            }}>
              <input
                type="checkbox"
                checked={hasMortgage}
                onChange={(e) => setHasMortgage(e.target.checked)}
                style={{ margin: 0 }}
              />
              Mortgage
            </label>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)",
              marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Other checks
            </div>
            <AP1Checklist matterId={matter.id} />
            <RequisitionList matterId={matter.id} />
          </div>
        </CardShell>
      </div>

    </div>
  );
}