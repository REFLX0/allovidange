import { prisma } from "@/lib/prisma";
import BookingWizard from "@/components/BookingWizard";
import { DEFAULT_SERVICES, type ServiceItem } from "@/lib/services";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prendre rendez-vous | ALLO VIDANGE",
  description: "Réservez votre vidange ou entretien automobile chez ALLO VIDANGE en quelques clics.",
};

export default async function ReservationPage() {
  let services: ServiceItem[] = [];

  try {
    const dbServices = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
        description: true,
        color: true,
      },
    });

    if (dbServices && dbServices.length > 0) {
      services = dbServices;
    }
  } catch (err) {
    console.warn("Using default services catalog (database offline or pending):", err);
  }

  // Si la base de données n'a pas encore de services enregistrés, utiliser le catalogue par défaut
  if (services.length === 0) {
    services = DEFAULT_SERVICES;
  }

  return <BookingWizard services={services} />;
}
