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

export default function MatterDocumentUpload({ matterId }: { matterId: string }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [documentType, setDocumentType] = useState("TR1");

  async function refreshDocs() {
    setLoadingDocs(true);
    try {
      const rows = await listMatterDocuments(matterId);
      setDocs(rows as DocRow[]);
    } catch (err: any) {
      setMessage(`Could not load documents: ${err?.message || "Unknown error"}`);
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
    setMessage("");

    try {
      await uploadMatterDocument(matterId, file, documentType);
      setMessage("Uploaded successfully ✅");
      e.target.value = "";
      await refreshDocs();
    } catch (err: any) {
      setMessage(`Upload failed: ${err?.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  }

  function getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Upload document</div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 14, display: "block", marginBottom: 6 }}>
          Document type
        </label>

        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ddd",
            width: "100%",
          }}
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <input type="file" onChange={onFileChange} disabled={uploading} />

      <div style={{ marginTop: 8, fontSize: 14 }}>
        {uploading ? "Uploading..." : message}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Documents</div>

        {loadingDocs ? (
          <div style={{ fontSize: 14, color: "#666" }}>Loading…</div>
        ) : docs.length === 0 ? (
          <div style={{ fontSize: 14, color: "#666" }}>No documents uploaded yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map((d) => {
              const url = getPublicUrl(d.storage_bucket, d.storage_path);
              return (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    border: "1px solid #eee",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 320,
                      }}
                    >
                      {d.file_name}
                    </div>
                    <div style={{ fontSize: 12, color: "#777" }}>
                      {new Date(d.created_at).toLocaleString()}
                    </div>
                  </div>

                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 14 }}
                  >
                    Open
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
``