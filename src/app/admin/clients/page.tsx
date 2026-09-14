import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { format } from "date-fns";
import { SAMPLE_CLIENTS } from "@/lib/sample-data";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Clients | ALLO VIDANGE" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const page = parseInt(params.page ?? "1");
  const perPage = 30;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  let clients: any[] = [];
  let total = 0;

  try {
    const [dbClients, dbTotal] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { appointments: true, vehicles: true } },
          appointments: {
            orderBy: { date: "desc" },
            take: 1,
            include: { service: true },
          },
          vehicles: {
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.customer.count({ where }),
    ]);
    clients = dbClients;
    total = dbTotal;
  } catch (err) {
    console.warn("DB offline on clients page, using sample clients:", err);
  }

  // Fallback demo data if DB is offline or empty
  if (clients.length === 0 && !search) {
    clients = SAMPLE_CLIENTS;
    total = SAMPLE_CLIENTS.length;
  } else if (clients.length === 0 && search) {
    const filtered = SAMPLE_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );
    clients = filtered;
    total = filtered.length;
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Clients</div>
          <div className="admin-page-subtitle">{total} client{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}</div>
        </div>
        <Link href="/admin/rendez-vous/nouveau" className="btn btn-primary">
          + Nouveau RDV Client
        </Link>
      </div>

      {/* Search */}
      <form method="GET" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Rechercher par nom, téléphone, email..."
          className="form-input"
          style={{ maxWidth: "320px" }}
        />
        <button type="submit" className="btn btn-secondary">Rechercher</button>
        {search && <Link href="/admin/clients" className="btn btn-ghost">Effacer</Link>}
      </form>

      {clients.length === 0 ? (
        <div className="empty-state" style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
          <div className="empty-state-icon">👤</div>
          <div className="empty-state-title">Aucun client trouvé</div>
          <div className="empty-state-desc">Essayez un autre mot-clé ou ajoutez un nouveau rendez-vous.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Véhicule(s)</th>
                <th>RDV</th>
                <th>Dernier service</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const lastAppt = client.appointments?.[0];
                const cleanPhone = client.phone ? formatWhatsAppNumber(client.phone) : "";
                const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
                const vehicle = client.vehicles?.[0];

                return (
                  <tr key={client.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{client.name}</div>
                      {client.email && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{client.email}</div>
                      )}
                      {client.notes && (
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>{client.notes}</div>
                      )}
                    </td>
                    <td>
                      <a href={`tel:${client.phone}`} style={{ color: "var(--brand-amber)", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
                        {client.phone}
                      </a>
                    </td>
                    <td>
                      {vehicle ? (
                        <div style={{ fontSize: "13px" }}>
                          <span style={{ fontWeight: 600 }}>{vehicle.brand} {vehicle.model}</span>
                          {vehicle.plate && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                              {vehicle.plate}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-faint)", fontSize: "13px" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-barlow, sans-serif)", fontSize: "18px", fontWeight: 700, color: "var(--brand-red)" }}>
                        {client._count?.appointments ?? 0}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px" }}>
                      {lastAppt ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{lastAppt.service?.name}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                            {format(new Date(lastAppt.date), "dd/MM/yyyy")}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-faint)" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {format(new Date(client.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            title="Contacter sur WhatsApp"
                            style={{ padding: "6px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                            </svg>
                            WhatsApp
                          </a>
                        )}
                        <Link
                          href={`/admin/rendez-vous?search=${encodeURIComponent(client.name)}`}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          RDVs
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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
          {page > 1 && (
            <Link href={`?${new URLSearchParams({ search, page: String(page - 1) })}`} className="btn btn-ghost btn-sm">← Précédent</Link>
          )}
          <span style={{ padding: "8px 16px", fontSize: "14px", color: "var(--text-muted)" }}>Page {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`?${new URLSearchParams({ search, page: String(page + 1) })}`} className="btn btn-ghost btn-sm">Suivant →</Link>
          )}
        </div>
      )}
    </div>
  );
}
