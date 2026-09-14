"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div style={{ display: "flex", minHeight: "60vh", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-xl)", padding: "40px", maxWidth: "460px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#FCA5A5", marginBottom: "8px" }}>
          Une erreur est survenue
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
          Une erreur inattendue s&apos;est produite. Veuillez réessayer ou revenir au tableau de bord.
        </p>
        {error.digest && (
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-faint)", marginBottom: "20px" }}>
            Code : {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={reset} className="btn btn-primary">Réessayer</button>
          <a href="/admin" className="btn btn-ghost">Tableau de bord</a>
        </div>
      </div>
    </div>
  );
}
