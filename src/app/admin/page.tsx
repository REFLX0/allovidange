import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";
import { buildAdminToCustomerUrl } from "@/lib/whatsapp";
import { SAMPLE_APPOINTMENTS } from "@/lib/sample-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tableau de bord | ALLO VIDANGE" };

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

export default async function AdminDashboard() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  let todayAppointments: any[] = [];
  let statusCounts: Record<string, number> = {};

  try {
    const [dbAppointments, stats] = await Promise.all([
      prisma.appointment.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
        include: {
          customer: true,
          vehicle: true,
          service: true,
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { date: { gte: todayStart, lte: todayEnd } },
        _count: { status: true },
      }),
    ]);

    todayAppointments = dbAppointments;
    statusCounts = stats.reduce(
      (acc, s) => ({ ...acc, [s.status]: s._count.status }),
      {} as Record<string, number>
    );
  } catch (err) {
    console.warn("DB offline on admin dashboard, using sample data:", err);
  }

  // Fallback demo data if DB is offline or has 0 appointments today
  if (todayAppointments.length === 0) {
    todayAppointments = SAMPLE_APPOINTMENTS;
    statusCounts = {
      PENDING: SAMPLE_APPOINTMENTS.filter((a) => a.status === "PENDING").length,
      CONFIRMED: SAMPLE_APPOINTMENTS.filter((a) => a.status === "CONFIRMED").length,
      IN_PROGRESS: SAMPLE_APPOINTMENTS.filter((a) => a.status === "IN_PROGRESS").length,
      COMPLETED: SAMPLE_APPOINTMENTS.filter((a) => a.status === "COMPLETED").length,
    };
  }

  const todayStr = format(today, "EEEE d MMMM yyyy", { locale: fr });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Tableau de bord</div>
          <div className="admin-page-subtitle" style={{ textTransform: "capitalize" }}>
            {todayStr}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/rendez-vous" className="btn btn-secondary">
            📋 Tous les rendez-vous
          </Link>
          <Link href="/admin/rendez-vous/nouveau" className="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau RDV
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid-4" style={{ marginBottom: "28px" }}>
        <div className="stat-card">
          <div className="stat-card-label">Aujourd&apos;hui</div>
          <div className="stat-card-value">{todayAppointments.length}</div>
          <div className="stat-card-meta">rendez-vous planifiés</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">En attente</div>
          <div className="stat-card-value" style={{ color: "var(--status-pending)" }}>
            {statusCounts["PENDING"] ?? 0}
          </div>
          <div className="stat-card-meta">à confirmer</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Confirmés</div>
          <div className="stat-card-value" style={{ color: "var(--status-confirmed)" }}>
            {statusCounts["CONFIRMED"] ?? 0}
          </div>
          <div className="stat-card-meta">prêts au garage</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">En cours / Terminés</div>
          <div className="stat-card-value" style={{ color: "var(--status-completed)" }}>
            {(statusCounts["IN_PROGRESS"] ?? 0) + (statusCounts["COMPLETED"] ?? 0)}
          </div>
          <div className="stat-card-meta">interventions du jour</div>
        </div>
      </div>

      {/* Today's appointments section */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "18px" }}>Rendez-vous prioritaires du jour</div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Cliquez sur <strong>Envoyer</strong> pour notifier directement le client sur WhatsApp
          </div>
        </div>
        <Link href="/admin/rendez-vous" style={{ fontSize: "13px", color: "var(--brand-red)", textDecoration: "none", fontWeight: 700 }}>
          Voir tout le calendrier →
        </Link>
      </div>

      {todayAppointments.length === 0 ? (
        <div className="empty-state" style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">Aucun rendez-vous aujourd&apos;hui</div>
          <div className="empty-state-desc">La journée est libre ou aucune réservation n&apos;a encore été prise.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {todayAppointments.map((appt) => {
            const customerPhone = appt.customer?.phone || "";
            const whatsappUrl = customerPhone
              ? buildAdminToCustomerUrl(customerPhone, {
                  customerName: appt.customer.name,
                  serviceName: appt.service.name,
                  date: appt.date,
                  startTime: format(appt.startTime, "HH:mm"),
                  reference: appt.reference,
                })
              : null;

            return (
              <div
                key={appt.id}
                className="card"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                  borderLeft: "4px solid var(--brand-red)",
                }}
              >
                {/* Time */}
                <div style={{ minWidth: "70px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--brand-amber)" }}>
                    {format(appt.startTime, "HH:mm")}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "monospace" }}>
                    {appt.reference}
                  </div>
                </div>

                {/* Customer & Vehicle */}
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "#fff" }}>
                      {appt.customer.name}
                    </span>
                    <span className={STATUS_BADGE[appt.status] ?? "badge"}>
                      {STATUS_LABELS[appt.status] ?? appt.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {customerPhone}
                    {appt.vehicle && (
                      <span> · 🚗 {appt.vehicle.brand} {appt.vehicle.model} ({appt.vehicle.plate || "Plaque non renseignée"})</span>
                    )}
                  </div>
                </div>

                {/* Service */}
                <div style={{ minWidth: "150px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {appt.service.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--brand-amber)", fontWeight: 700 }}>
                    {appt.service.price ? `${appt.service.price} DT` : ""} · {appt.service.duration} min
                  </div>
                </div>

                {/* Actions: Direct WhatsApp send + Detail link */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      title={`Envoyer le message WhatsApp à ${appt.customer.name} (${customerPhone})`}
                      style={{
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                      </svg>
                      Envoyer
                    </a>
                  )}
                  <Link
                    href={`/admin/rendez-vous/${appt.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                  >
                    Détails →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
