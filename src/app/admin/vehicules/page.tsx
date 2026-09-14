import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { format } from "date-fns";
import { SAMPLE_VEHICLES } from "@/lib/sample-data";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Véhicules | ALLO VIDANGE" };

export default async function VehiclesPage({
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
          { plate: { contains: search, mode: "insensitive" as const } },
          { brand: { contains: search, mode: "insensitive" as const } },
          { model: { contains: search, mode: "insensitive" as const } },
          { customer: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  let vehicles: any[] = [];
  let total = 0;

  try {
    const [dbVehicles, dbTotal] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          customer: true,
          _count: { select: { appointments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.vehicle.count({ where }),
    ]);
    vehicles = dbVehicles;
    total = dbTotal;
  } catch (err) {
    console.warn("DB offline on vehicles page, using sample vehicles:", err);
  }

  // Fallback demo data if DB is offline or empty
  if (vehicles.length === 0 && !search) {
    vehicles = SAMPLE_VEHICLES;
    total = SAMPLE_VEHICLES.length;
  } else if (vehicles.length === 0 && search) {
    const filtered = SAMPLE_VEHICLES.filter(
      (v) =>
        (v.plate && v.plate.toLowerCase().includes(search.toLowerCase())) ||
        v.brand.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        (v.customer && v.customer.name.toLowerCase().includes(search.toLowerCase()))
    );
    vehicles = filtered;
    total = filtered.length;
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Véhicules</div>
          <div className="admin-page-subtitle">{total} véhicule{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}</div>
        </div>
        <Link href="/admin/rendez-vous/nouveau" className="btn btn-primary">
          + Nouveau RDV Véhicule
        </Link>
      </div>

      {/* Search */}
      <form method="GET" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Rechercher immatriculation, marque, modèle, client..."
          className="form-input"
          style={{ maxWidth: "360px" }}
        />
        <button type="submit" className="btn btn-secondary">Rechercher</button>
        {search && <Link href="/admin/vehicules" className="btn btn-ghost">Effacer</Link>}
      </form>

      {vehicles.length === 0 ? (
        <div className="empty-state" style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
          <div className="empty-state-icon">🚗</div>
          <div className="empty-state-title">Aucun véhicule trouvé</div>
          <div className="empty-state-desc">Modifiez vos termes de recherche pour trouver un véhicule.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Immatriculation</th>
                <th>Véhicule</th>
                <th>Motorisation</th>
                <th>Kilométrage</th>
                <th>Propriétaire</th>
                <th>Enregistré le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((veh) => {
                const customer = veh.customer;
                const customerPhone = customer?.phone ? formatWhatsAppNumber(customer.phone) : "";
                const whatsappUrl = customerPhone ? `https://wa.me/${customerPhone}` : null;

                return (
                  <tr key={veh.id}>
                    <td>
                      {veh.plate ? (
                        <div
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            background: "#111",
                            border: "1px solid #333",
                            borderRadius: "4px",
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            fontSize: "13px",
                            color: "#fff",
                          }}
                        >
                          {veh.plate}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-faint)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: "14px" }}>
                        🚗 {veh.brand} {veh.model}
                      </div>
                      {veh.year && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Année : {veh.year}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                        {veh.engine ?? "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--brand-amber)" }}>
                        {veh.mileage ? `${veh.mileage.toLocaleString()} km` : "—"}
                      </span>
                    </td>
                    <td>
                      {customer ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{customer.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{customer.phone}</div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-faint)" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {format(new Date(veh.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            title="Contacter le propriétaire sur WhatsApp"
                            style={{ padding: "6px 10px", fontSize: "12px" }}
                          >
                            WhatsApp
                          </a>
                        )}
                        <Link
                          href={`/admin/rendez-vous?search=${encodeURIComponent(veh.plate || veh.model)}`}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          Historique RDV
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
