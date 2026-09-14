import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Paramètres | ALLO VIDANGE" };

const DEFAULT_HOURS = [
  { dayOfWeek: 0, isOpen: false, openTime: "08:00", closeTime: "18:00" }, // Dimanche
  { dayOfWeek: 1, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Lundi
  { dayOfWeek: 2, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Mardi
  { dayOfWeek: 3, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Mercredi
  { dayOfWeek: 4, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Jeudi
  { dayOfWeek: 5, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Vendredi
  { dayOfWeek: 6, isOpen: true,  openTime: "08:00", closeTime: "13:00" }, // Samedi
];

const DEFAULT_SETTINGS = {
  id: "singleton",
  businessName: "ALLO VIDANGE",
  phone: "+216 20 123 456",
  whatsappPhone: "+216 20 123 456",
  email: "contact@allovidange.tn",
  address: "Avenue Habib Bourguiba, Tunis, Tunisie",
  googleMapsUrl: "https://maps.google.com",
  appointmentDuration: 30,
  bufferTime: 0,
  minBookingNotice: 60,
  maxBookingHorizon: 30,
};

export default async function SettingsPage() {
  let settings: any = null;
  let hours: any[] = [];

  try {
    const [dbSettings, dbHours] = await Promise.all([
      prisma.businessSettings.findUnique({ where: { id: "singleton" } }),
      prisma.businessHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    ]);
    settings = dbSettings;
    hours = dbHours;
  } catch (err) {
    console.warn("DB offline on settings page, using default settings:", err);
  }

  // Initialize business hours if not set in DB
  const finalHours = DEFAULT_HOURS.map((def) => {
    const existing = hours.find((h) => h.dayOfWeek === def.dayOfWeek);
    return existing ?? def;
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Paramètres</div>
          <div className="admin-page-subtitle">Configuration générale de ALLO VIDANGE</div>
        </div>
      </div>
      <SettingsForm
        settings={settings ?? DEFAULT_SETTINGS}
        hours={finalHours}
      />
    </div>
  );
}
