import { useMemo } from "react";

type DocRow = {
  document_type: string | null;
};

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

export default function MissingDocsPanel({
  matter,
  docs,
}: {
  matter: any;
  docs: DocRow[];
}) {
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
        </>
      )}
    </div>
  );
}