import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";
import AppointmentActions from "@/components/admin/AppointmentActions";
import {
  buildAdminToCustomerUrl,
  buildAdminReminderUrl,
  buildAdminReadyUrl,
  buildCallUrl,
} from "@/lib/whatsapp";
import { SAMPLE_APPOINTMENTS } from "@/lib/sample-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Détail rendez-vous | ALLO VIDANGE" };

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge badge-pending",
  CONFIRMED: "badge badge-confirmed",
  IN_PROGRESS: "badge badge-progress",
  COMPLETED: "badge badge-completed",
  CANCELLED: "badge badge-cancelled",
  NO_SHOW: "badge badge-noshow",
};

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params;

  let appt: any = null;

  try {
    appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            appointments: {
              include: { service: true },
              orderBy: { date: "desc" },
              take: 5,
            },
          },
        },
        vehicle: true,
        service: true,
      },
    });
  } catch (err) {
    console.warn("DB offline on appointment detail:", err);
  }

  // Fallback demo data
  if (!appt) {
    const demo = SAMPLE_APPOINTMENTS.find((a) => a.id === id || a.reference === id);
    if (demo) {
      appt = {
        ...demo,
        customer: {
          ...demo.customer,
          appointments: [demo],
        },
      };
    }
  }

  if (!appt) notFound();

  const dateStr = format(appt.date, "EEEE d MMMM yyyy", { locale: fr });
  const startTime = format(appt.startTime, "HH:mm");
  const endTime = format(appt.endTime, "HH:mm");

  // Format WhatsApp URLs to the CUSTOMER's phone number
  const customerPhone = appt.customer?.phone || "";
  const appointmentInfo = {
    customerName: appt.customer.name,
    serviceName: appt.service.name,
    date: appt.date,
    startTime,
    reference: appt.reference,
  };

  const confirmWhatsappUrl = customerPhone
    ? buildAdminToCustomerUrl(customerPhone, appointmentInfo)
    : null;

  const reminderWhatsappUrl = customerPhone
    ? buildAdminReminderUrl(customerPhone, appointmentInfo)
    : null;

  const readyWhatsappUrl = customerPhone
    ? buildAdminReadyUrl(customerPhone, {
        customerName: appt.customer.name,
        serviceName: appt.service.name,
        reference: appt.reference,
      })
    : null;

  const callUrl = customerPhone ? buildCallUrl(customerPhone) : null;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link
            href="/admin/rendez-vous"
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour aux rendez-vous
          </Link>
          <div className="admin-page-title">Rendez-vous {appt.reference}</div>
          <div
            className="admin-page-subtitle"
            style={{ textTransform: "capitalize", display: "flex", alignItems: "center", gap: "12px" }}
          >
            {dateStr} à {startTime}
            <span className={STATUS_BADGE[appt.status] ?? "badge"}>
              {STATUS_LABELS[appt.status] ?? appt.status}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {confirmWhatsappUrl && (
            <a
              href={confirmWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
              title="Envoyer la confirmation WhatsApp directement au client"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              Envoyer Confirmation WhatsApp
            </a>
          )}
          {callUrl && (
            <a
              href={callUrl}
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              Appeler
            </a>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Status actions */}
          <div className="card">
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px",
              }}
            >
              Statut de l&apos;intervention
            </div>
            <AppointmentActions appointmentId={appt.id} currentStatus={appt.status} />
          </div>

          {/* WhatsApp Direct Send Toolbox */}
          <div className="card" style={{ borderLeft: "4px solid #25D366" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                Envoyer des notifications WhatsApp au client
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Cliquez pour ouvrir WhatsApp immédiatement avec le message type prérempli pour ce client :
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              {confirmWhatsappUrl && (
                <a
                  href={confirmWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ justifyContent: "center", fontSize: "13px" }}
                >
                  📨 1. Confirmer RDV
                </a>
              )}
              {reminderWhatsappUrl && (
                <a
                  href={reminderWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ justifyContent: "center", fontSize: "13px" }}
                >
                  ⏰ 2. Rappel du RDV
                </a>
              )}
              {readyWhatsappUrl && (
                <a
                  href={readyWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ justifyContent: "center", fontSize: "13px" }}
                >
                  🚗 3. Véhicule Prêt !
                </a>
              )}
            </div>
          </div>

          {/* Appointment details */}
          <div className="card">
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px",
              }}
            >
              Détails de la réservation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                ["Prestation", appt.service.name],
                ["Date", dateStr],
                ["Heure", `${startTime} – ${endTime}`],
                ["Durée prévue", `${appt.service.duration} min`],
                ["Référence publique", appt.reference],
                ["Enregistré le", format(appt.createdAt, "dd/MM/yyyy HH:mm")],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              {appt.service.price && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", paddingTop: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Prix estimatif</span>
                  <span style={{ fontWeight: 700, color: "var(--brand-amber)" }}>{appt.service.price} DT</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer & Vehicle sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Customer card */}
          <div className="card">
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px",
              }}
            >
              Client
            </div>
            <div style={{ fontWeight: 700, fontSize: "17px", marginBottom: "4px", color: "#fff" }}>
              {appt.customer.name}
            </div>
            <div style={{ fontSize: "15px", color: "var(--brand-amber)", fontWeight: 700, marginBottom: "6px" }}>
              📱 {appt.customer.phone}
            </div>
            {appt.customer.email && (
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                ✉️ {appt.customer.email}
              </div>
            )}
            {appt.customer.notes && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <strong>Note :</strong> {appt.customer.notes}
              </div>
            )}

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {confirmWhatsappUrl && (
                <a
                  href={confirmWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-sm btn-full"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                  </svg>
                  Écrire sur WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Vehicle card */}
          <div className="card">
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px",
              }}
            >
              Véhicule
            </div>
            {appt.vehicle ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "#fff" }}>
                  🚗 {appt.vehicle.brand} {appt.vehicle.model}
                </div>
                {appt.vehicle.plate && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      background: "#111",
                      border: "2px solid #333",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#fff",
                      width: "fit-content",
                    }}
                  >
                    {appt.vehicle.plate}
                  </div>
                )}
                {appt.vehicle.engine && (
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Moteur : {appt.vehicle.engine}
                  </div>
                )}
                {appt.vehicle.year && (
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Année : {appt.vehicle.year}
                  </div>
                )}
                {appt.vehicle.mileage && (
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Kilométrage : {appt.vehicle.mileage.toLocaleString()} km
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: "var(--text-faint)", fontSize: "13px" }}>
                Aucun véhicule renseigné
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
