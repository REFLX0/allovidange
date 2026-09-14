"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DEFAULT_SERVICES } from "@/lib/services";

// ============================================================
// TYPES
// ============================================================
interface Service {
  id: string;
  name: string;
  duration: number;
  price: number | null;
  description: string | null;
  color: string;
}

interface BookingData {
  // Step 1
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  // Step 2
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNotes: string;
  // Step 3
  vehicleBrand: string;
  vehicleModel: string;
  vehicleEngine: string;
  vehicleYear: string;
  vehiclePlate: string;
  vehicleMileage: string;
  // Step 4
  date: string;
  startTime: string;
  endTime: string;
}

const INITIAL_DATA: BookingData = {
  serviceId: "",
  serviceName: "",
  serviceDuration: 30,
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerNotes: "",
  vehicleBrand: "",
  vehicleModel: "",
  vehicleEngine: "",
  vehicleYear: "",
  vehiclePlate: "",
  vehicleMileage: "",
  date: "",
  startTime: "",
  endTime: "",
};

const STEPS = [
  { label: "Service" },
  { label: "Coordonnées" },
  { label: "Véhicule" },
  { label: "Créneau" },
  { label: "Confirmation" },
];

const SERVICE_ICONS: Record<string, string> = {
  vidange: "🛢️",
  filtre: "🔧",
  diagnostic: "🔌",
  entretien: "📋",
  liquide: "💧",
  pression: "🔄",
  air: "💨",
};

function getIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "⚙️";
}

// ============================================================
// STEP 1 — SERVICE SELECTION
// ============================================================
function StepService({
  data,
  services,
  onSelect,
}: {
  data: BookingData;
  services: Service[];
  onSelect: (s: Service) => void;
}) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "24px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
        Choisissez votre service
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>
        Sélectionnez la prestation dont vous avez besoin.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px 20px",
              background: data.serviceId === service.id ? "color-mix(in srgb, var(--brand-red) 12%, transparent)" : "var(--bg-card)",
              border: `1px solid ${data.serviceId === service.id ? "var(--brand-red)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-lg)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 150ms ease",
              width: "100%",
            }}
          >
            <div style={{
              width: "44px", height: "44px", borderRadius: "var(--radius-md)",
              background: "color-mix(in srgb, var(--brand-red) 15%, transparent)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "22px", flexShrink: 0
            }}>
              {getIcon(service.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
                {service.name}
              </div>
              {service.description && (
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {service.description}
                </div>
              )}
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: "13px", color: "var(--brand-amber)", fontWeight: 600 }}>
                {service.duration} min
              </div>
              {service.price && (
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {service.price.toLocaleString()} DT
                </div>
              )}
            </div>
            {data.serviceId === service.id && (
              <div style={{ color: "var(--brand-red)", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// STEP 2 — CUSTOMER INFO
// ============================================================
function StepCustomer({
  data,
  onChange,
  errors,
}: {
  data: BookingData;
  onChange: (field: keyof BookingData, value: string) => void;
  errors: Partial<Record<keyof BookingData, string>>;
}) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "24px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
        Vos coordonnées
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>
        Ces informations nous permettent de vous contacter pour confirmer le rendez-vous.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Nom complet *</label>
          <input
            type="text"
            className={`form-input ${errors.customerName ? "error" : ""}`}
            placeholder="Ex : Ahmed Ben Ali"
            value={data.customerName}
            onChange={(e) => onChange("customerName", e.target.value)}
            autoComplete="name"
          />
          {errors.customerName && <div className="form-error">{errors.customerName}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Téléphone *</label>
          <input
            type="tel"
            className={`form-input ${errors.customerPhone ? "error" : ""}`}
            placeholder="Ex : 55 123 456"
            value={data.customerPhone}
            onChange={(e) => onChange("customerPhone", e.target.value)}
            autoComplete="tel"
          />
          {errors.customerPhone && <div className="form-error">{errors.customerPhone}</div>}
          <div className="form-hint">Numéro tunisien (8 chiffres) ou international</div>
        </div>

        <div className="form-group">
          <label className="form-label">Email <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(optionnel)</span></label>
          <input
            type="email"
            className="form-input"
            placeholder="votre@email.com"
            value={data.customerEmail}
            onChange={(e) => onChange("customerEmail", e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(optionnel)</span></label>
          <textarea
            className="form-textarea"
            placeholder="Ex : Problème particulier à signaler, demande spécifique..."
            value={data.customerNotes}
            onChange={(e) => onChange("customerNotes", e.target.value)}
            rows={3}
            style={{ resize: "vertical" }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 3 — VEHICLE INFO
// ============================================================
function StepVehicle({
  data,
  onChange,
  errors,
}: {
  data: BookingData;
  onChange: (field: keyof BookingData, value: string) => void;
  errors: Partial<Record<keyof BookingData, string>>;
}) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "24px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
        Votre véhicule
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>
        Ces informations permettent à notre équipe de préparer l&apos;intervention.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Marque *</label>
            <input
              type="text"
              className={`form-input ${errors.vehicleBrand ? "error" : ""}`}
              placeholder="Ex : Peugeot"
              value={data.vehicleBrand}
              onChange={(e) => onChange("vehicleBrand", e.target.value)}
            />
            {errors.vehicleBrand && <div className="form-error">{errors.vehicleBrand}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Modèle *</label>
            <input
              type="text"
              className={`form-input ${errors.vehicleModel ? "error" : ""}`}
              placeholder="Ex : 308"
              value={data.vehicleModel}
              onChange={(e) => onChange("vehicleModel", e.target.value)}
            />
            {errors.vehicleModel && <div className="form-error">{errors.vehicleModel}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Motorisation <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(optionnel)</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Ex : 1.6 HDi, 1.2 TSI, 2.0 TDI..."
            value={data.vehicleEngine}
            onChange={(e) => onChange("vehicleEngine", e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">
              Année <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(opt.)</span>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="Ex : 2019"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={data.vehicleYear}
              onChange={(e) => onChange("vehicleYear", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Immatriculation <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(opt.)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex : 123 TU 4567"
              value={data.vehiclePlate}
              onChange={(e) => onChange("vehiclePlate", e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Kilométrage <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(optionnel)</span>
          </label>
          <input
            type="number"
            className="form-input"
            placeholder="Ex : 85000"
            min="0"
            value={data.vehicleMileage}
            onChange={(e) => onChange("vehicleMileage", e.target.value)}
          />
          <div className="form-hint">Kilométrage actuel de votre véhicule</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 4 — DATE & TIME
// ============================================================
interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function StepDateTime({
  data,
  onDateSelect,
  onTimeSelect,
}: {
  data: BookingData;
  onDateSelect: (date: string) => void;
  onTimeSelect: (start: string, end: string) => void;
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [daysWithSlots, setDaysWithSlots] = useState<Set<string>>(new Set());

  // Fetch availability summary for the current month view
  useEffect(() => {
    const fetchSummary = async () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth() + 1;
      try {
        const res = await fetch(
          `/api/public/availability/summary?year=${year}&month=${month}&serviceId=${data.serviceId}`
        );
        if (res.ok) {
          const summary: Record<string, boolean> = await res.json();
          const available = new Set(
            Object.entries(summary)
              .filter(([, v]) => v)
              .map(([k]) => k)
          );
          setDaysWithSlots(available);
        }
      } catch {
        // ignore
      }
    };
    if (data.serviceId) fetchSummary();
  }, [viewDate, data.serviceId]);

  // Fetch time slots when date selected
  useEffect(() => {
    if (!data.date) {
      setSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(
          `/api/public/availability?date=${data.date}&serviceId=${data.serviceId}`
        );
        if (res.ok) {
          const s: TimeSlot[] = await res.json();
          setSlots(s);
        }
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [data.date, data.serviceId]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };

  const nextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  };

  const handleDayClick = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (d < today && d.toDateString() !== today.toDateString()) return;
    const dateStr = d.toISOString().split("T")[0];
    onDateSelect(dateStr);
    onTimeSelect("", "");
  };

  const selectedDate = data.date ? new Date(data.date + "T00:00:00") : null;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "24px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
        Choisissez votre créneau
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
        Les créneaux disponibles sont affichés en temps réel.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px", alignItems: "start" }}>
        {/* Calendar */}
        <div className="mini-calendar">
          <div className="mini-calendar-header">
            <button className="mini-calendar-nav" onClick={prevMonth} aria-label="Mois précédent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="mini-calendar-title">
              {MONTH_NAMES_FR[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button className="mini-calendar-nav" onClick={nextMonth} aria-label="Mois suivant">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <div className="mini-calendar-grid">
            {DAY_LABELS.map((d) => (
              <div key={d} className="mini-calendar-day-label">{d}</div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="mini-calendar-day empty" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === viewDate.getMonth() &&
                selectedDate?.getFullYear() === viewDate.getFullYear();
              const isToday = d.toDateString() === today.toDateString();
              const hasSlots = daysWithSlots.has(dateStr);

              let cls = "mini-calendar-day";
              if (isSelected) cls += " selected";
              else if (isToday) cls += " today";
              if (hasSlots && !isPast) cls += " has-slots";

              return (
                <button
                  key={day}
                  className={cls}
                  onClick={() => handleDayClick(day)}
                  disabled={isPast}
                  aria-label={`${day} ${MONTH_NAMES_FR[viewDate.getMonth()]}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div>
          {!data.date ? (
            <div style={{ color: "var(--text-muted)", fontSize: "14px", padding: "20px 0" }}>
              Sélectionnez une date pour voir les créneaux disponibles.
            </div>
          ) : loadingSlots ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", padding: "20px 0" }}>
              <div className="spinner spinner-dark" />
              Chargement des créneaux...
            </div>
          ) : slots.filter((s) => s.available).length === 0 ? (
            <div style={{ padding: "20px 0" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "8px" }}>
                Aucun créneau disponible pour cette date.
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-faint)" }}>
                Essayez une autre date.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                {data.date && new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div className="time-slots">
                {slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    className={`time-slot${!slot.available ? " unavailable" : ""}${data.startTime === slot.startTime ? " selected" : ""}`}
                    onClick={() => slot.available && onTimeSelect(slot.startTime, slot.endTime)}
                    disabled={!slot.available}
                    aria-label={`${slot.startTime}`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 5 — REVIEW & CONFIRM
// ============================================================
function StepConfirm({
  data,
  onSubmit,
  loading,
  error,
}: {
  data: BookingData;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}) {
  const dateStr = data.date
    ? new Date(data.date + "T00:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "24px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
        Confirmer le rendez-vous
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
        Vérifiez les informations avant de confirmer.
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "20px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Service */}
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Service
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>{data.serviceName}</div>
            <div style={{ fontSize: "13px", color: "var(--brand-amber)", fontWeight: 600 }}>{data.serviceDuration} min</div>
          </div>
        </div>

        {/* Date & Heure */}
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Date & Heure
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{dateStr}</div>
            <div style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "22px", fontWeight: 700, color: "var(--brand-amber)" }}>
              {data.startTime}
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Vos coordonnées
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Nom</span>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>{data.customerName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Téléphone</span>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>{data.customerPhone}</span>
            </div>
            {data.customerEmail && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Email</span>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{data.customerEmail}</span>
              </div>
            )}
            {data.customerNotes && (
              <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Notes</span>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", background: "var(--bg-elevated)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
                  {data.customerNotes}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Véhicule */}
        <div className="card">
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Véhicule
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Véhicule</span>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                {data.vehicleBrand} {data.vehicleModel}
                {data.vehicleEngine ? ` ${data.vehicleEngine}` : ""}
              </span>
            </div>
            {data.vehicleYear && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Année</span>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{data.vehicleYear}</span>
              </div>
            )}
            {data.vehiclePlate && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Immatriculation</span>
                <span style={{ fontWeight: 600, fontSize: "14px", fontFamily: "monospace" }}>{data.vehiclePlate}</span>
              </div>
            )}
            {data.vehicleMileage && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Kilométrage</span>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{parseInt(data.vehicleMileage).toLocaleString()} km</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="btn btn-primary btn-full btn-lg"
        style={{ marginTop: "24px" }}
      >
        {loading ? (
          <>
            <div className="spinner" />
            Confirmation en cours...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Confirmer mon rendez-vous
          </>
        )}
      </button>

      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "12px" }}>
        Aucun paiement à l&apos;avance. Votre réservation sera confirmée par notre équipe.
      </p>
    </div>
  );
}

// ============================================================
// MAIN WIZARD
// ============================================================
export default function BookingWizard({ services }: { services: Service[] }) {
  const activeServices = services && services.length > 0 ? services : DEFAULT_SERVICES;
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BookingData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof BookingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof BookingData, string>> = {};

    if (step === 0) {
      if (!data.serviceId) {
        newErrors.serviceId = "Veuillez sélectionner un service.";
      }
    }

    if (step === 1) {
      if (!data.customerName.trim()) newErrors.customerName = "Le nom est requis.";
      if (!data.customerPhone.trim()) newErrors.customerPhone = "Le numéro de téléphone est requis.";
      else if (!/^[\d\s\+\-\(\)\.]{7,15}$/.test(data.customerPhone.trim())) {
        newErrors.customerPhone = "Numéro de téléphone invalide.";
      }
    }

    if (step === 2) {
      if (!data.vehicleBrand.trim()) newErrors.vehicleBrand = "La marque est requise.";
      if (!data.vehicleModel.trim()) newErrors.vehicleModel = "Le modèle est requis.";
    }

    if (step === 3) {
      if (!data.date) newErrors.date = "Veuillez sélectionner une date.";
      if (!data.startTime) newErrors.startTime = "Veuillez sélectionner un créneau.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setErrors({});
    setSubmitError(null);
  };

  const handleServiceSelect = (service: Service) => {
    setData((prev) => ({
      ...prev,
      serviceId: service.id,
      serviceName: service.name,
      serviceDuration: service.duration,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/public/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: data.serviceId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || undefined,
          customerNotes: data.customerNotes || undefined,
          vehicleBrand: data.vehicleBrand,
          vehicleModel: data.vehicleModel,
          vehicleEngine: data.vehicleEngine || undefined,
          vehicleYear: data.vehicleYear ? parseInt(data.vehicleYear) : undefined,
          vehiclePlate: data.vehiclePlate || undefined,
          vehicleMileage: data.vehicleMileage ? parseInt(data.vehicleMileage) : undefined,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || "Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      router.push(`/reservation/confirmation/${result.reference}`);
    } catch {
      setSubmitError("Erreur de connexion. Vérifiez votre connexion internet et réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed =
    (step === 0 && !!data.serviceId) ||
    (step === 1 && !!data.customerName && !!data.customerPhone) ||
    (step === 2 && !!data.vehicleBrand && !!data.vehicleModel) ||
    (step === 3 && !!data.date && !!data.startTime) ||
    step === 4;

  return (
    <div className="booking-wizard">
      {/* Header */}
      <div className="booking-header">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/logo.png" alt="ALLO VIDANGE" width={36} height={36} style={{ objectFit: "contain" }} />
          <div style={{ fontFamily: "var(--font-barlow, sans-serif)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "15px" }}>
            ALLO VIDANGE
          </div>
        </Link>
        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Réservation en ligne</div>
      </div>

      {/* Premium progress bar */}
      <div className="booking-progress-bar-wrap">
        <div className="booking-progress-track">
          <div
            className="booking-progress-fill"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="booking-steps">
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div className={`booking-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
              <div className="booking-step-number">
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <div className="booking-step-label">{s.label}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`booking-step-connector${i < step ? " done" : ""}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="booking-content" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px)" }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: "translateY(0)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(-7px)" }}
            transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            {step === 0 && (
              <StepService data={data} services={activeServices} onSelect={handleServiceSelect} />
            )}
            {step === 1 && (
              <StepCustomer data={data} onChange={handleChange} errors={errors} />
            )}
            {step === 2 && (
              <StepVehicle data={data} onChange={handleChange} errors={errors} />
            )}
            {step === 3 && (
              <StepDateTime
                data={data}
                onDateSelect={(date) => handleChange("date", date)}
                onTimeSelect={(start, end) => {
                  handleChange("startTime", start);
                  handleChange("endTime", end);
                }}
              />
            )}
            {step === 4 && (
              <StepConfirm
                data={data}
                onSubmit={handleSubmit}
                loading={submitting}
                error={submitError}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      {step < 4 && (
        <div className="booking-footer">
          <button
            onClick={handleBack}
            className="btn btn-ghost"
            disabled={step === 0}
            style={{ visibility: step === 0 ? "hidden" : "visible" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Retour
          </button>

          {/* Error indicator */}
          {(errors.serviceId || errors.date || errors.startTime) && (
            <div style={{ fontSize: "13px", color: "#EF4444" }}>
              {errors.serviceId || errors.date || errors.startTime}
            </div>
          )}

          <button
            onClick={handleNext}
            className="btn btn-primary"
            disabled={!canProceed}
          >
            {step === 3 ? "Vérifier" : "Continuer"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
