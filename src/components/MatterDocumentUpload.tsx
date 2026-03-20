import { useState } from "react";
import { uploadMatterDocument } from "../lib/uploadMatterDocument";

export default function MatterDocumentUpload({ matterId }: { matterId: string }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function onFileChange(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      await uploadMatterDocument(matterId, file);
      setMessage("Uploaded successfully ✅");
      e.target.value = "";
    } catch (err: any) {
      setMessage(`Upload failed: ${err?.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Upload document</div>
      <input type="file" onChange={onFileChange} disabled={uploading} />
      <div style={{ marginTop: 8, fontSize: 14 }}>
        {uploading ? "Uploading..." : message}
      </div>
    </div>
  );
}