export default function FileUpload() {
  return (
    <div className="card">
      <h2>Document Upload</h2>
      <p className="text-muted mt-1" style={{ fontSize: '.875rem' }}>
        Supabase Storage integration planned for v2. Files will be attached to the matter
        and optionally processed by AI to extract requisition data.
      </p>
      <div className="upload-zone mt-2">
        📎 Drag & drop files here — coming soon
      </div>
    </div>
  );
}
