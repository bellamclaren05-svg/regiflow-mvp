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
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Inline icons ─────────────────────────────────────────────────────────────

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

// ── Small layout helpers ──────────────────────────────────────────────────────

function SectionCard({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "18px 20px",
        marginBottom: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
        {title}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em",
        textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-primary)", fontWeight: 400 }}>
        {value || "—"}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const colour =
    s === "active"   ? { bg: "var(--accent-soft)",  text: "var(--accent-text)" } :
    s === "complete" ? { bg: "var(--success-soft)",  text: "var(--success)" }    :
    s === "pending"  ? { bg: "var(--warning-soft)",  text: "var(--warning)" }    :
                       { bg: "#F1F3F9",              text: "var(--text-secondary)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: colour.bg, color: colour.text,
    }}>
      {status}
    </span>
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

  const [savingFlags, setSavingFlags] = useState(false);
  const [flagsSaved, setFlagsSaved]   = useState(false);
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

  // ── Loading / error states ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10,
        color: "var(--text-muted)", fontSize: 13, padding: "40px 0" }}>
        <span>Loading matter…</span>
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 22 }}>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none",
          marginBottom: 10,
        }}>
          <IconArrowLeft /> All Matters
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.3px",
              color: "var(--text-primary)", marginBottom: 4 }}>
              {matter.title}
            </h1>
            {matter.reference && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12,
                color: "var(--text-muted)" }}>
                {matter.reference}
              </span>
            )}
          </div>
          <StatusBadge status={matter.status} />
        </div>
      </div>

      {/* ── Matter details ── */}
      <SectionCard>
        <CardHeader title="Matter Details" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px 24px" }}>
          <DetailRow label="Completion Date" value={formatDate(matter.completion_date)} />
          <DetailRow label="Created"         value={formatDate(matter.created_at)} />
          <DetailRow label="Status"          value={matter.status} />
        </div>
      </SectionCard>

      {/* ── Existing components (unchanged logic) ── */}
      <SDLTCountdown completionDate={matter.completion_date} />
      <AP1Checklist matterId={matter.id} />
      <RequisitionList matterId={matter.id} />

      {/* ── Document upload ── */}
      <SectionCard style={{ marginTop: 14 }}>
        <CardHeader
          title="Documents"
          sub="Upload and manage matter documents"
        />
        <MatterDocumentUpload matterId={matter.id} />
      </SectionCard>

      {/* ── Automation flags ── */}
      <SectionCard>
        <CardHeader
          title="Matter Flags"
          sub="Controls which documents and tasks are required"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 14, marginBottom: 16 }}>

          {/* Transaction type */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500,
              color: "var(--text-secondary)", marginBottom: 5 }}>
              Transaction type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 13,
                fontFamily: "var(--font)",
                color: "var(--text-primary)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-strong)",
                borderRadius: 8,
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Select…</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div style={{ display: "flex", flexDirection: "column",
            gap: 10, paddingTop: 22 }}>

            <label style={{ display: "flex", alignItems: "center",
              gap: 9, cursor: "pointer", fontSize: 13,
              color: "var(--text-secondary)", fontWeight: 400 }}>
              <input
                type="checkbox"
                checked={isLeasehold}
                onChange={(e) => setIsLeasehold(e.target.checked)}
                style={{ margin: 0 }}
              />
              Leasehold
            </label>

            <label style={{ display: "flex", alignItems: "center",
              gap: 9, cursor: "pointer", fontSize: 13,
              color: "var(--text-secondary)", fontWeight: 400 }}>
              <input
                type="checkbox"
                checked={hasMortgage}
                onChange={(e) => setHasMortgage(e.target.checked)}
                style={{ margin: 0 }}
              />
              Mortgage
            </label>
          </div>
        </div>

        {/* Save button + confirmation */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={saveMatterFlags}
            disabled={savingFlags}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px",
              background: savingFlags ? "var(--border)" : "var(--accent)",
              color: savingFlags ? "var(--text-muted)" : "#fff",
              border: "none", borderRadius: 8,
              fontFamily: "var(--font)", fontSize: 13, fontWeight: 500,
              cursor: savingFlags ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
            }}
          >
            <IconSave />
            {savingFlags ? "Saving…" : "Save flags"}
          </button>

          {flagsSaved && (
            <span style={{ fontSize: 12.5, color: "var(--success)",
              display: "flex", alignItems: "center", gap: 4 }}>
              ✓ Saved
            </span>
          )}
        </div>
      </SectionCard>

      {/* ── Missing docs panel ── */}
      <MissingDocsPanel
        matter={{
          ...matter,
          transaction_type: transactionType,
          is_leasehold: isLeasehold,
          has_mortgage: hasMortgage,
        }}
        docs={docs ?? []}
      />

      {/* ── Tasks panel ── */}
      <MatterTasksPanel matterId={matter.id} />

    </div>
  );
}
