"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: string;
  color: string;
  isActive: boolean;
}

const INITIAL_FORM: ServiceFormData = {
  name: "",
  description: "",
  duration: 30,
  price: "",
  color: "#C0101A",
  isActive: true,
};

export default function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      duration: service.duration,
      price: service.price ? String(service.price) : "",
      color: service.color,
      isActive: service.isActive,
    });
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      name: form.name,
      description: form.description || null,
      duration: form.duration,
      price: form.price ? parseInt(form.price) : null,
      color: form.color,
      isActive: form.isActive,
    };

    try {
      const url = editing
        ? `/api/admin/services/${editing.id}`
        : "/api/admin/services";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur lors de la sauvegarde.");
        return;
      }

      const saved = await res.json();

      if (editing) {
        // Update existing service in local state
        setServices((prev) =>
          prev.map((s) => (s.id === saved.id ? saved : s))
        );
      } else {
        // Append new service to local state
        setServices((prev) => [...prev, saved]);
      }

      setShowForm(false);
      router.refresh();
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    // Optimistically update UI immediately
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s))
    );
    try {
      await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      router.refresh();
    } catch {
      // Revert on error
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: service.isActive } : s))
      );
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Supprimer le service "${service.name}" ?`)) return;
    // Optimistically remove from UI
    setServices((prev) => prev.filter((s) => s.id !== service.id));
    try {
      await fetch(`/api/admin/services/${service.id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      // Revert on error
      setServices((prev) => [...prev, service]);
    }
  };


  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button onClick={openCreate} className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouveau service
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "28px",
            width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto"
          }}>
            <h2 style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "20px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "20px" }}>
              {editing ? "Modifier le service" : "Nouveau service"}
            </h2>

            {error && <div className="alert alert-error" style={{ marginBottom: "16px" }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Nom du service *</label>
                <input type="text" className="form-input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex : Vidange moteur" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description courte du service" style={{ resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Durée (min) *</label>
                  <input type="number" className="form-input" required min={5} max={480} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: parseInt(e.target.value) || 30 }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Prix (DT, optionnel)</label>
                  <input type="number" className="form-input" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="—" />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} style={{ width: "40px", height: "36px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: "2px" }} />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Couleur calendrier</span>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} style={{ width: "16px", height: "16px" }} />
                <span style={{ fontSize: "14px" }}>Service actif (visible à la réservation)</span>
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <div className="empty-state" style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
          <div className="empty-state-icon">⚙️</div>
          <div className="empty-state-title">Aucun service configuré</div>
          <div className="empty-state-desc">Ajoutez vos premières prestations pour les proposer à la réservation.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {services.map((service) => (
            <div key={service.id} className="card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "6px", height: "48px", borderRadius: "4px", background: service.color, flexShrink: 0 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 700, fontSize: "15px" }}>{service.name}</span>
                  {!service.isActive && (
                    <span className="badge" style={{ background: "rgba(107,114,128,0.15)", color: "#9CA3AF", border: "1px solid rgba(107,114,128,0.2)", fontSize: "10px" }}>Inactif</span>
                  )}
                </div>
                {service.description && (
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{service.description}</div>
                )}
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "18px", fontWeight: 700, color: "var(--brand-amber)" }}>{service.duration}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>min</div>
                </div>
                {service.price && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{service.price.toLocaleString()}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>DT</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleToggleActive(service)} className="btn btn-ghost btn-sm" title={service.isActive ? "Désactiver" : "Activer"}>
                  {service.isActive ? "🟢" : "⭕"}
                </button>
                <button onClick={() => openEdit(service)} className="btn btn-ghost btn-sm">Modifier</button>
                <button onClick={() => handleDelete(service)} className="btn btn-ghost btn-sm" style={{ color: "var(--status-cancelled)" }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
