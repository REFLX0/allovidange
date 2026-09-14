"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

interface BusinessSettingsData {
  id: string;
  businessName: string;
  phone: string | null;
  whatsappPhone: string | null;
  email: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  appointmentDuration: number;
  bufferTime: number;
  minBookingNotice: number;
  maxBookingHorizon: number;
}

interface HourData {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface Props {
  settings: BusinessSettingsData;
  hours: HourData[];
}

export default function SettingsForm({ settings, hours }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: settings.businessName,
    phone: settings.phone ?? "",
    whatsappPhone: settings.whatsappPhone ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
    googleMapsUrl: settings.googleMapsUrl ?? "",
    appointmentDuration: settings.appointmentDuration,
    bufferTime: settings.bufferTime,
    minBookingNotice: settings.minBookingNotice,
    maxBookingHorizon: settings.maxBookingHorizon,
  });

  const [businessHours, setBusinessHours] = useState<HourData[]>(hours);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHour = (dayOfWeek: number, field: keyof HourData, value: boolean | string) => {
    setBusinessHours((prev) =>
      prev.map((h) => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form, businessHours }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur lors de la sauvegarde.");
        return;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {success && (
        <div className="alert alert-success">
          ✅ Paramètres enregistrés avec succès.
        </div>
      )}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* General info */}
      <div className="card">
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
          Informations générales
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Nom du commerce</label>
            <input type="text" className="form-input" value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Téléphone principal</label>
              <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Ex : +216 55 000 000" />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input type="tel" className="form-input" value={form.whatsappPhone} onChange={(e) => setForm((f) => ({ ...f, whatsappPhone: e.target.value }))} placeholder="Ex : +216 55 000 000" />
              <div className="form-hint">Format international requis</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email <span style={{ fontWeight: 400, textTransform: "none", color: "var(--text-muted)" }}>(optionnel)</span></label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="contact@allovidange.tn" />
          </div>

          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input type="text" className="form-input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Ex : 12 Rue de la République, Bardo, Tunis" />
          </div>

          <div className="form-group">
            <label className="form-label">URL Google Maps (iframe embed)</label>
            <input type="url" className="form-input" value={form.googleMapsUrl} onChange={(e) => setForm((f) => ({ ...f, googleMapsUrl: e.target.value }))} placeholder="https://maps.google.com/maps?..." />
            <div className="form-hint">
              Google Maps → Partager → Intégrer → copiez le src de l&apos;iframe
            </div>
          </div>
        </div>
      </div>

      {/* Booking config */}
      <div className="card">
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
          Paramètres de réservation
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">Durée par défaut (min)</label>
            <input type="number" className="form-input" min={5} max={480} value={form.appointmentDuration} onChange={(e) => setForm((f) => ({ ...f, appointmentDuration: parseInt(e.target.value) || 30 }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Tampon entre RDV (min)</label>
            <input type="number" className="form-input" min={0} max={120} value={form.bufferTime} onChange={(e) => setForm((f) => ({ ...f, bufferTime: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Préavis minimum (min)</label>
            <input type="number" className="form-input" min={0} max={1440} value={form.minBookingNotice} onChange={(e) => setForm((f) => ({ ...f, minBookingNotice: parseInt(e.target.value) || 60 }))} />
            <div className="form-hint">Délai minimum avant réservation</div>
          </div>
          <div className="form-group">
            <label className="form-label">Horizon de réservation (jours)</label>
            <input type="number" className="form-input" min={1} max={365} value={form.maxBookingHorizon} onChange={(e) => setForm((f) => ({ ...f, maxBookingHorizon: parseInt(e.target.value) || 30 }))} />
            <div className="form-hint">Combien de jours à l&apos;avance</div>
          </div>
        </div>
      </div>

      {/* Business hours */}
      <div className="card">
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
          Horaires d&apos;ouverture
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {businessHours.map((hour) => (
            <div key={hour.dayOfWeek} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", minWidth: "120px" }}>
                <input
                  type="checkbox"
                  checked={hour.isOpen}
                  onChange={(e) => updateHour(hour.dayOfWeek, "isOpen", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{DAY_NAMES[hour.dayOfWeek]}</span>
              </label>

              {hour.isOpen ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="time"
                    value={hour.openTime}
                    onChange={(e) => updateHour(hour.dayOfWeek, "openTime", e.target.value)}
                    className="form-input"
                    style={{ maxWidth: "120px" }}
                  />
                  <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>–</span>
                  <input
                    type="time"
                    value={hour.closeTime}
                    onChange={(e) => updateHour(hour.dayOfWeek, "closeTime", e.target.value)}
                    className="form-input"
                    style={{ maxWidth: "120px" }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Fermé</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-lg">
          {saving ? (
            <><div className="spinner" /> Enregistrement...</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Enregistrer les paramètres
            </>
          )}
        </button>
      </div>
    </div>
  );
}
