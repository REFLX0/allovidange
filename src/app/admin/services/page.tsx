import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ServicesManager from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Services | ALLO VIDANGE" };

export default async function ServicesPage() {
  let services: any[] = [];

  try {
    services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch (err) {
    console.warn("DB offline on services page, using default services:", err);
  }

  // Empty state handled by ServicesManager UI
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Services</div>
          <div className="admin-page-subtitle">Gérez les prestations proposées à la réservation</div>
        </div>
      </div>
      <ServicesManager initialServices={services} />
    </div>
  );
}
