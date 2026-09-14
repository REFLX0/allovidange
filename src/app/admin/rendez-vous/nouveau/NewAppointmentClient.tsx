"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number | null;
}

export default function NewAppointmentClient({ services }: { services: ServiceItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Client
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerNotes: "",
    // Véhicule
    vehicleBrand: "",
    vehicleModel: "",
    vehiclePlate: "",
    vehicleEngine: "",
    vehicleYear: "",
    vehicleMileage: "",
    // Prestation & Timing
    serviceId: services[0]?.id || "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    // Options admin
    status: "CONFIRMED",
    internalNotes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setError("Le nom et le téléphone du client sont obligatoires.");
      setLoading(false);
      return;
    }

    if (!formData.vehicleBrand.trim() || !formData.vehicleModel.trim()) {
      setError("La marque et le modèle du véhicule sont obligatoires.");
      setLoading(false);
      return;
    }

    if (!formData.serviceId) {
      setError("Veuillez sélectionner une prestation.");
      setLoading(false);
      return;
    }

    const selectedService = services.find((s) => s.id === formData.serviceId);
    const duration = selectedService?.duration || 30;

    // Calculer heure de fin
    const [h, m] = formData.startTime.split(":").map(Number);
    const endTotalMinutes = h * 60 + m + duration;
    const endH = Math.floor(endTotalMinutes / 60) % 24;
    const endM = endTotalMinutes % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/public/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
          customerEmail: formData.customerEmail.trim() || undefined,
          customerNotes: formData.customerNotes.trim() || undefined,
          vehicleBrand: formData.vehicleBrand.trim(),
          vehicleModel: formData.vehicleModel.trim(),
          vehiclePlate: formData.vehiclePlate.trim() || undefined,
          vehicleEngine: formData.vehicleEngine.trim() || undefined,
          vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : undefined,
          vehicleMileage: formData.vehicleMileage ? parseInt(formData.vehicleMileage) : undefined,
          date: formData.date,
          startTime: formData.startTime,
          endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du rendez-vous.");
        return;
      }

      // Si le statut choisi est différent de PENDING, ou si des notes internes ont été saisies
      if (formData.status !== "PENDING" || formData.internalNotes) {
        if (data.id) {
          await fetch(`/api/admin/appointments/${data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              internalNotes: formData.internalNotes || undefined,
            }),
          });
          if (formData.status !== "PENDING") {
            await fetch(`/api/admin/appointments/${data.id}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: formData.status }),
            });
          }
        }
      }

      router.push(`/admin/rendez-vous/${data.id}`);
      router.refresh();
    } catch {
      setError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px" }}>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Nouveau rendez-vous</div>
          <div className="admin-page-subtitle">Créer une réservation manuelle pour un client</div>
        </div>
        <Link href="/admin/rendez-vous" className="btn btn-secondary">
          Retour à la liste
        </Link>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#FEF2F2",
          border: "1px solid #FCA5A5",
          color: "#991B1B",
          padding: "14px 18px",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Section Client */}
        <div className="card">
          <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>👤</span> Informations Client
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div>
              <label className="form-label">Nom complet *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Ex : Mohamed Trabelsi"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Téléphone *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="Ex : +216 20 123 456"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Email (optionnel)</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="client@email.com"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Remarques client (optionnel)</label>
              <input
                type="text"
                name="customerNotes"
                value={formData.customerNotes}
                onChange={handleChange}
                placeholder="Demandes particulières..."
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section Véhicule */}
        <div className="card">
          <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🚗</span> Véhicule
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label className="form-label">Marque *</label>
              <input
                type="text"
                name="vehicleBrand"
                value={formData.vehicleBrand}
                onChange={handleChange}
                placeholder="Ex : Peugeot"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Modèle *</label>
              <input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                placeholder="Ex : 308"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Immatriculation</label>
              <input
                type="text"
                name="vehiclePlate"
                value={formData.vehiclePlate}
                onChange={handleChange}
                placeholder="Ex : 198 TU 4521"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Motorisation</label>
              <input
                type="text"
                name="vehicleEngine"
                value={formData.vehicleEngine}
                onChange={handleChange}
                placeholder="Ex : 1.6 HDi"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Année</label>
              <input
                type="number"
                name="vehicleYear"
                value={formData.vehicleYear}
                onChange={handleChange}
                placeholder="Ex : 2018"
                min="1990"
                max={new Date().getFullYear() + 1}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Kilométrage (km)</label>
              <input
                type="number"
                name="vehicleMileage"
                value={formData.vehicleMileage}
                onChange={handleChange}
                placeholder="Ex : 95000"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section Prestation & Créneau */}
        <div className="card">
          <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📅</span> Prestation & Date
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label className="form-label">Prestation *</label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="form-select"
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration} min) {s.price ? `— ${s.price} DT` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Date du rendez-vous *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Heure de début *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Statut initial</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="CONFIRMED">Confirmé (recommandé)</option>
                <option value="PENDING">En attente</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminé</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label className="form-label">Notes internes garage (non visibles par le client)</label>
            <textarea
              name="internalNotes"
              value={formData.internalNotes}
              onChange={handleChange}
              rows={3}
              placeholder="Ex : Huile 5W30 fournie par le client, filtre à air à vérifier impérativement..."
              className="form-input"
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <Link href="/admin/rendez-vous" className="btn btn-secondary">
            Annuler
          </Link>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Création en cours..." : "Enregistrer le rendez-vous"}
          </button>
        </div>
      </form>
    </div>
  );
}
