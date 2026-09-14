import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";
import { buildAdminToCustomerUrl } from "@/lib/whatsapp";
import { SAMPLE_APPOINTMENTS } from "@/lib/sample-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Rendez-vous | ALLO VIDANGE" };

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

interface SearchParams {
  status?: string;
  search?: string;
  date?: string;
  page?: string;
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const perPage = 25;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.date) {
    const d = new Date(params.date + "T00:00:00");
    where.date = d;
  }

  if (params.search) {
    const s = params.search;
    where.OR = [
      { customer: { name: { contains: s, mode: "insensitive" } } },
      { customer: { phone: { contains: s } } },
      { vehicle: { plate: { contains: s, mode: "insensitive" } } },
      { reference: { contains: s, mode: "insensitive" } },
    ];
  }

  let appointments: any[] = [];
  let total = 0;

  try {
    const [dbAppointments, dbTotal] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer: true,
          vehicle: true,
          service: true,
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        skip,
        take: perPage,
      }),
      prisma.appointment.count({ where }),
    ]);
    appointments = dbAppointments;
    total = dbTotal;
  } catch (err) {
    console.warn("DB offline on appointments page:", err);
  }

  // Fallback demo data if DB is empty or offline
  if (appointments.length === 0 && !params.search && !params.date && !params.status) {
    appointments = SAMPLE_APPOINTMENTS;
    total = SAMPLE_APPOINTMENTS.length;
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Rendez-vous</div>
          <div className="admin-page-subtitle">{total} rendez-vous au total</div>
        </div>
        <Link href="/admin/rendez-vous/nouveau" className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouveau RDV
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Rechercher client, tél, plaque..."
          className="form-input"
          style={{ maxWidth: "240px" }}
        />
        <input
          type="date"
          name="date"
          defaultValue={params.date ?? ""}
          className="form-input"
          style={{ maxWidth: "160px" }}
        />
        <select name="status" defaultValue={params.status ?? ""} className="form-select" style={{ maxWidth: "160px" }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-secondary">Filtrer</button>
        {(params.search || params.date || params.status) && (
          <Link href="/admin/rendez-vous" className="btn btn-ghost">Réinitialiser</Link>
        )}
      </form>

      {/* Table */}
      {appointments.length === 0 ? (
        <div className="empty-state" style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Aucun rendez-vous trouvé</div>
          <div className="empty-state-desc">Modifiez vos filtres pour voir d&apos;autres résultats.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Client</th>
                <th>Véhicule</th>
                <th>Prestation</th>
                <th>Statut</th>
                <th>Réf.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => {
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
                  <tr key={appt.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>
                        {format(appt.date, "dd/MM/yyyy")}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--brand-amber)", fontWeight: 700 }}>
                        {format(appt.startTime, "HH:mm")}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.customer.name}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{customerPhone}</div>
                    </td>
                    <td>
                      {appt.vehicle ? (
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>
                            {appt.vehicle.brand} {appt.vehicle.model}
                          </div>
                          {appt.vehicle.plate && (
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                              {appt.vehicle.plate}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-faint)", fontSize: "13px" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: "13px" }}>{appt.service.name}</td>
                    <td>
                      <span className={STATUS_BADGE[appt.status] ?? "badge"}>
                        {STATUS_LABELS[appt.status] ?? appt.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "monospace" }}>
                        {appt.reference}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            title="Envoyer message WhatsApp au client"
                            style={{ padding: "6px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                            </svg>
                            Envoyer
                          </a>
                        )}
                        <Link href={`/admin/rendez-vous/${appt.id}`} className="btn btn-ghost btn-sm" style={{ padding: "6px 10px", fontSize: "12px" }}>
                          Détails
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "24px" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/rendez-vous?page=${p}${params.status ? `&status=${params.status}` : ""}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}`}
              className={`btn btn-sm ${p === page ? "btn-primary" : "btn-ghost"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
