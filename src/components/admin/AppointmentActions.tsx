"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  appointmentId: string;
  currentStatus: string;
}

const TRANSITIONS: Record<string, { label: string; nextStatus: string; className: string }[]> = {
  PENDING: [
    { label: "✅ Confirmer", nextStatus: "CONFIRMED", className: "btn btn-primary btn-sm" },
    { label: "❌ Annuler", nextStatus: "CANCELLED", className: "btn btn-ghost btn-sm" },
  ],
  CONFIRMED: [
    { label: "🔧 Démarrer l'intervention", nextStatus: "IN_PROGRESS", className: "btn btn-primary btn-sm" },
    { label: "🚫 Client absent", nextStatus: "NO_SHOW", className: "btn btn-ghost btn-sm" },
    { label: "❌ Annuler", nextStatus: "CANCELLED", className: "btn btn-ghost btn-sm" },
  ],
  IN_PROGRESS: [
    { label: "✅ Marquer comme terminé", nextStatus: "COMPLETED", className: "btn btn-primary btn-sm" },
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export default function AppointmentActions({ appointmentId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const actions = TRANSITIONS[currentStatus] ?? [];

  const handleStatusChange = async (nextStatus: string) => {
    if (!confirm(`Confirmer le changement de statut vers "${nextStatus}" ?`)) return;

    setLoading(nextStatus);
    setError(null);

    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors du changement de statut.");
        return;
      }

      router.refresh();
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(null);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes }),
      });
      router.refresh();
    } catch {
      // silent
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "12px" }}>
          {error}
        </div>
      )}

      {actions.length > 0 ? (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {actions.map((action) => (
            <button
              key={action.nextStatus}
              onClick={() => handleStatusChange(action.nextStatus)}
              disabled={loading !== null}
              className={action.className}
            >
              {loading === action.nextStatus ? (
                <><div className="spinner spinner-dark" /> En cours...</>
              ) : (
                action.label
              )}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
          Aucune action disponible pour ce statut.
        </div>
      )}

      {/* Internal notes */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Notes internes
        </div>
        <textarea
          className="form-textarea"
          rows={3}
          placeholder="Notes visibles uniquement par l'équipe..."
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          style={{ resize: "vertical", marginBottom: "8px" }}
        />
        <button
          onClick={handleSaveNotes}
          disabled={savingNotes}
          className="btn btn-secondary btn-sm"
        >
          {savingNotes ? "Enregistrement..." : "Enregistrer les notes"}
        </button>
      </div>
    </div>
  );
}
