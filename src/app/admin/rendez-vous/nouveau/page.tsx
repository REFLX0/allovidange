import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import NewAppointmentClient from "./NewAppointmentClient";
import { DEFAULT_SERVICES } from "@/lib/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Nouveau rendez-vous | ALLO VIDANGE",
};

export default async function NewAppointmentPage() {
  let services: any[] = [];

  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
      },
    });
  } catch (err) {
    console.warn("DB offline on new appointment page, using default services:", err);
  }

  if (services.length === 0) {
    services = DEFAULT_SERVICES.map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      price: s.price,
    }));
  }

  return <NewAppointmentClient services={services} />;
}
