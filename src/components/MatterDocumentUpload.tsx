// src/components/MatterDocumentUpload.tsx
import { useEffect, useState } from "react";
import { uploadMatterDocument } from "../lib/uploadMatterDocument";
import { listMatterDocuments } from "../lib/listMatterDocuments";
import { supabase } from "../lib/supabaseClient";

type DocRow = {
  id: string;
  file_name: string;
  storage_bucket: string;
  storage_path: string;
  created_at: string;
};

const DOCUMENT_TYPES = [
  "TR1",
  "Completion Statement",
  "Mortgage Deed",
  "AP1",
  "SDLT5 Certificate",
  "Notice of Transfer",
  "Certificate",
  "Other",
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconUpload = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 9V2M4 4.5L6.5 2 9 4.5" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.5 10.5h10" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconDoc = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 2h6l3 3v7a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z"
      stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 2v3h3M4 7h5M4 9.5h3" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconOpen = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M8 1h3m0 0v3m0-3L5.5 6.5" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDocDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MatterDocumentUpload({ matterId }: { matterId: string }) {
  const [uploading, setUploading]       = useState(false);
  const [message, setMessage]           = useState<{ text: string; ok: boolean } | null>(null);
  const [docs, setDocs]                 = useState<DocRow[]>([]);
  const [loadingDocs, setLoadingDocs]   = useState(false);
  const [documentType, setDocumentType] = useState("TR1");

  async function refreshDocs() {
    setLoadingDocs(true);
    try {
      const rows = await listMatterDocuments(matterId);
      setDocs(rows as DocRow[]);
    } catch (err: any) {
      setMessage({ text: `Could not load documents: ${err?.message || "Unknown error"}`, ok: false });
    } finally {
      setLoadingDocs(false);
    }
  }

  useEffect(() => {
    if (!matterId) return;
    refreshDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matterId]);

  async function onFileChange(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      await uploadMatterDocument(matterId, file, documentType);
      setMessage({ text: "Uploaded successfully", ok: true });
      e.target.value = "";
      await refreshDocs();
      window.dispatchEvent(new Event("docs-updated"));
      window.dispatchEvent(new Event("tasks-updated"));
    } catch (err: any) {
      setMessage({ text: `Upload failed: ${err?.message || "Unknown error"}`, ok: false });
    } finally {
      setUploading(false);
    }
  }

  function getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  return (
    <div>
      {/* ── Upload row ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: 10,
        alignItems: "flex-end",
        marginBottom: 16,
      }}>

        {/* Document type */}
        <div>
          <label style={{
            display: "block", fontSize: 12, fontWeight: 500,
            color: "var(--text-secondary)", marginBottom: 5,
          }}>
            Document type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
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
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* File picker — styled label over hidden input */}
        <div>
          <label style={{
            display: "block", fontSize: 12, fontWeight: 500,
            color: "var(--text-secondary)", marginBottom: 5,
          }}>
            File
          </label>
          <label style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 12px",
            background: "var(--bg-page)",
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            fontSize: 13, color: "var(--text-secondary)",
            cursor: uploading ? "not-allowed" : "pointer",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}>
            <IconDoc />
            Choose file…
            <input
              type="file"
              onChange={onFileChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Upload button */}
        <button
          disabled={uploading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px",
            background: uploading ? "var(--border)" : "var(--accent)",
            color: uploading ? "var(--text-muted)" : "#fff",
            border: "none", borderRadius: 8,
            fontFamily: "var(--font)", fontSize: 13, fontWeight: 500,
            cursor: uploading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            height: 36,
          }}
        >
          <IconUpload />
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {/* ── Status message ── */}
      {message && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12.5, fontWeight: 500, marginBottom: 14,
          color: message.ok ? "var(--success)" : "var(--danger)",
        }}>
          {message.ok ? "✓" : "✕"} {message.text}
        </div>
      )}

      {/* ── Document list ── */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 500, letterSpacing: "0.05em",
          textTransform: "uppercase", color: "var(--text-muted)",
          marginBottom: 8,
        }}>
          Uploaded Documents
        </div>

        {loadingDocs && (
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", padding: "10px 0" }}>
            Loading…
          </div>
        )}

        {!loadingDocs && docs.length === 0 && (
          <div style={{
            fontSize: 12.5, color: "var(--text-muted)",
            padding: "10px 14px",
            background: "#FAFBFF",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}>
            No documents uploaded yet.
          </div>
        )}

        {!loadingDocs && docs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {docs.map((d) => {
              const url = getPublicUrl(d.storage_bucket, d.storage_path);
              return (
                <div key={d.id} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: 12,
                  padding: "10px 14px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}>
                  {/* File info */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: 10, minWidth: 0, flex: 1,
                  }}>
                    <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                      <IconDoc />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500,
                        color: "var(--text-primary)",
                        overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {d.file_name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                        {formatDocDate(d.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Open link */}
                  
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 10px",
                      background: "var(--bg-page)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: 7,
                      fontSize: 12, fontWeight: 500,
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      flexShrink: 0,
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
                    Open <IconOpen />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}