// src/pages/index.tsx
import Link from "next/link";
import useSWR from "swr";
import { Matter } from "@/lib/types";
import { formatDate, sdltDaysRemaining } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Inline icons ──────────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6h7M6 2.5L9.5 6 6 9.5" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconEmpty = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="4" y="6" width="24" height="20" rx="3"
      stroke="var(--border-strong)" strokeWidth="1.5"/>
    <path d="M4 12h24" stroke="var(--border-strong)" strokeWidth="1.5"/>
    <path d="M10 18h6M10 22h4" stroke="var(--border-strong)"
      strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ── SDLT badge ────────────────────────────────────────────────────────────────

function SdltBadge({ completionDate }: { completionDate: string | null | undefined }) {
  const days = sdltDaysRemaining(completionDate);

  if (days === null) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center",
        padding: "2px 8px", borderRadius: 20,
        fontSize: 11, fontWeight: 500,
        background: "#F1F3F9", color: "var(--text-muted)",
      }}>
        No date
      </span>
    );
  }

  const overdue  = days < 0;
  const urgent   = days >= 0 && days <= 3;
  const ok       = days > 3;

  const style = overdue ? {
    bg: "var(--danger-soft)", text: "var(--danger)",
    label: `${Math.abs(days)}d overdue`,
  } : urgent ? {
    bg: "var(--warning-soft)", text: "var(--warning)",
    label: `${days}d left`,
  } : {
    bg: "var(--success-soft)", text: "var(--success)",
    label: `${days}d left`,
  };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: style.bg, color: style.text,
    }}>
      {style.label}
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

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
      padding: "2px 8px", borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: cfg.bg, color: cfg.text,
    }}>
      {status}
    </span>
  );
}

// ── Type pills ────────────────────────────────────────────────────────────────

function TypePills({ matter }: { matter: Matter }) {
  const tx = (matter as any).transaction_type as string | null;
  const leasehold = !!(matter as any).is_leasehold;
  const mortgage  = !!(matter as any).has_mortgage;

  if (!tx && !leasehold && !mortgage) {
    return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>;
  }

  const pillStyle = (bg: string, text: string): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center",
    padding: "2px 7px", borderRadius: 20,
    fontSize: 11, fontWeight: 500,
    background: bg, color: text, marginRight: 4,
  });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {tx === "purchase" && (
        <span style={pillStyle("var(--accent-soft)", "var(--accent-text)")}>
          Purchase
        </span>
      )}
      {tx === "sale" && (
        <span style={pillStyle("#FFF7ED", "#92400E")}>
          Sale
        </span>
      )}
      {leasehold && (
        <span style={pillStyle("var(--success-soft)", "var(--success)")}>
          Leasehold
        </span>
      )}
      {mortgage && (
        <span style={pillStyle("var(--warning-soft)", "var(--warning)")}>
          Mortgage
        </span>
      )}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  valueColour,
  sub,
}: {
  label: string;
  value: string | number;
  valueColour?: string;
  sub?: string;
}) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "14px 16px",
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 500, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px",
        color: valueColour ?? "var(--text-primary)", lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IndexPage() {
  const { data, error, isLoading } = useSWR<Matter[]>("/api/matters", fetcher);

  // Derive summary stats from loaded data
  const active   = data?.filter((m) => m.status?.toLowerCase() === "active").length  ?? 0;
  const complete = data?.filter((m) => m.status?.toLowerCase() === "complete").length ?? 0;
  const urgent   = data?.filter((m) => {
    const d = sdltDaysRemaining(m.completion_date);
    return d !== null && d >= 0 && d <= 3;
  }).length ?? 0;
  const total = data?.length ?? 0;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 22,
      }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 600, letterSpacing: "-0.3px",
            color: "var(--text-primary)",
          }}>
            Matters
          </h1>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>
            Post-completion workflow dashboard
          </div>
        </div>

        <Link href="/matters/new" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px",
          background: "var(--accent)", color: "#fff",
          borderRadius: 8, fontSize: 13, fontWeight: 500,
          textDecoration: "none",
          transition: "opacity 0.15s",
        }}>
          <IconPlus /> New Matter
        </Link>
      </div>

      {/* ── Stats row (only when data loaded) ── */}
      {data && data.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}>
          <StatCard label="Total Matters"  value={total}    sub="All time" />
          <StatCard label="Active"         value={active}   valueColour="var(--accent-text)"  sub="In progress" />
          <StatCard label="SDLT Urgent"    value={urgent}   valueColour="var(--warning)"      sub="Due in ≤3 days" />
          <StatCard label="Completed"      value={complete} valueColour="var(--success)"      sub="Closed matters" />
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          color: "var(--text-muted)", fontSize: 13, padding: "40px 0",
        }}>
          Loading matters…
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: "var(--danger-soft)",
          border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: 8, padding: "12px 16px",
          fontSize: 13, color: "var(--danger)",
        }}>
          Failed to load matters. Check your Supabase connection.
        </div>
      )}

      {/* ── Empty state ── */}
      {data && data.length === 0 && (
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "56px 24px",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12, textAlign: "center",
        }}>
          <IconEmpty />
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
            No matters yet
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", maxWidth: 280 }}>
            Create your first matter to start tracking post-completion workflows.
          </div>
          <Link href="/matters/new" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 4, padding: "8px 16px",
            background: "var(--accent)", color: "#fff",
            borderRadius: 8, fontSize: 13, fontWeight: 500,
            textDecoration: "none",
          }}>
            <IconPlus /> Create your first matter
          </Link>
        </div>
      )}

      {/* ── Table ── */}
      {data && data.length > 0 && (
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
        }}>

          {/* Table header bar */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 16px",
            borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
              Active Matters
            </span>
            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
              {total} {total === 1 ? "matter" : "matters"}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Property / Title", "Reference", "Type", "Completion", "SDLT", "Status", ""].map((h) => (
                    <th key={h} style={{
                      textAlign: "left",
                      fontSize: 10.5, fontWeight: 500,
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      color: "var(--text-muted)",
                      padding: "9px 16px",
                      background: "#FAFBFF",
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((m, i) => (
                  <tr
                    key={m.id}
                    style={{ borderBottom: i < data.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement)
                        .querySelectorAll("td")
                        .forEach((td) => ((td as HTMLElement).style.background = "#FAFBFF"));
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement)
                        .querySelectorAll("td")
                        .forEach((td) => ((td as HTMLElement).style.background = "transparent"));
                    }}
                  >
                    {/* Title */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <Link href={`/matters/${m.id}`} style={{
                        fontSize: 13, fontWeight: 500,
                        color: "var(--accent-text)", textDecoration: "none",
                      }}>
                        {m.title}
                      </Link>
                    </td>

                    {/* Reference */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 11.5,
                        color: "var(--text-muted)",
                      }}>
                        {m.reference ?? "—"}
                      </span>
                    </td>

                    {/* Type pills */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <TypePills matter={m} />
                    </td>

                    {/* Completion date */}
                    <td style={{
                      padding: "12px 16px", verticalAlign: "middle",
                      color: "var(--text-secondary)", whiteSpace: "nowrap",
                    }}>
                      {formatDate(m.completion_date)}
                    </td>

                    {/* SDLT countdown */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <SdltBadge completionDate={m.completion_date} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <StatusBadge status={m.status} />
                    </td>

                    {/* View link */}
                    <td style={{
                      padding: "12px 16px", verticalAlign: "middle",
                      textAlign: "right", whiteSpace: "nowrap",
                    }}>
                      <Link href={`/matters/${m.id}`} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 10px",
                        background: "var(--bg-page)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: 7, fontSize: 12, fontWeight: 500,
                        color: "var(--text-secondary)", textDecoration: "none",
                        transition: "border-color 0.12s, color 0.12s",
                      }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
                          (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent-text)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
                          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                        }}
                      >
                        Open <IconArrowRight />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
