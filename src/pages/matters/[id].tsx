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

export default function MatterDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: matter,
    error,
    isLoading,
    mutate: mutateMatter,
  } = useSWR<Matter>(id ? `/api/matters?id=${id}` : null, fetcher);

  // Fetch documents (with document_type) for missing-docs automation
  const { data: docs, mutate: mutateDocs } = useSWR<any[]>(
    matter?.id ? `/api/documents?matterId=${matter.id}` : null,
    fetcher
  );

  // Local UI state for automation flags
  const [savingFlags, setSavingFlags] = useState(false);
  const [transactionType, setTransactionType] = useState<string>("");
  const [isLeasehold, setIsLeasehold] = useState<boolean>(false);
  const [hasMortgage, setHasMortgage] = useState<boolean>(false);

  // Initialise flags from matter when it loads/changes
  useEffect(() => {
    if (!matter) return;
    setTransactionType(((matter as any).transaction_type ?? "") as string);
    setIsLeasehold(!!(matter as any).is_leasehold);
    setHasMortgage(!!(matter as any).has_mortgage);
  }, [matter?.id]);

  // IMPORTANT: Listen for docs-updated events (from uploader) and refresh docs SWR
  useEffect(() => {
    function onDocsUpdated() {
      mutateDocs();
    }

    window.addEventListener("docs-updated", onDocsUpdated);
    return () => window.removeEventListener("docs-updated", onDocsUpdated);
  }, [mutateDocs]);

  async function saveMatterFlags() {
    if (!matter?.id) return;

    setSavingFlags(true);
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
        throw new Error(
          data?.error ? JSON.stringify(data.error) : "Failed to save flags"
        );
      }

      await mutateMatter();
    } catch (e: any) {
      alert(e?.message || "Failed to save flags");
    } finally {
      setSavingFlags(false);
    }
  }

  if (isLoading) return <p className="text-muted">Loading matter…</p>;

  if (error || !matter || (matter as unknown as { error: string }).error) {
    return (
      <>
        <p className="error-msg">Matter not found.</p>
        <Link href="/">← Back to Matters</Link>
      </>
    );
  }

  return (
    <>
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: "1.5rem" }}
      >
        <div>
          <Link href="/" style={{ fontSize: ".875rem" }}>
            ← All Matters
          </Link>
          <h1 style={{ marginTop: ".25rem" }}>{matter.title}</h1>
          {matter.reference && (
            <p className="text-muted">Ref: {matter.reference}</p>
          )}
        </div>
        <span className="badge badge-info">{matter.status}</span>
      </div>

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h2>Matter Details</h2>
        <div
          className="mt-1"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: ".5rem 2rem",
          }}
        >
          <div>
            <span className="text-muted">Completion Date</span>
            <div>{formatDate(matter.completion_date)}</div>
          </div>
          <div>
            <span className="text-muted">Created</span>
            <div>{formatDate(matter.created_at)}</div>
          </div>
        </div>
      </div>

      <SDLTCountdown completionDate={matter.completion_date} />
      <AP1Checklist matterId={matter.id} />
      <RequisitionList matterId={matter.id} />

      {/* Document upload + list */}
      <MatterDocumentUpload matterId={matter.id} />

      {/* Automation flags editor */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h2>Matter Flags (for automation)</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: 12,
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
              Transaction type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              <option value="">Select...</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingTop: 24,
            }}
          >
            <label style={{ fontSize: 14 }}>
              <input
                type="checkbox"
                checked={isLeasehold}
                onChange={(e) => setIsLeasehold(e.target.checked)}
              />{" "}
              Leasehold
            </label>

            <label style={{ fontSize: 14 }}>
              <input
                type="checkbox"
                checked={hasMortgage}
                onChange={(e) => setHasMortgage(e.target.checked)}
              />{" "}
              Mortgage
            </label>
          </div>
        </div>

        <button
          onClick={saveMatterFlags}
          disabled={savingFlags}
          style={{
            marginTop: 12,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        >
          {savingFlags ? "Saving..." : "Save flags"}
        </button>
      </div>

      {/* Missing docs panel (✅/❌ + create tasks button) */}
      <MissingDocsPanel
        matter={{
          ...matter,
          transaction_type: transactionType,
          is_leasehold: isLeasehold,
          has_mortgage: hasMortgage,
        }}
        docs={docs ?? []}
      />

      {/* Tasks panel (shows created tasks and lets you tick them) */}
      <MatterTasksPanel matterId={matter.id} />
    </>
  );
}
