import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed ALLO VIDANGE...");

  // ============================================================
  // ADMIN USER
  // ============================================================
  const hashedPassword = await hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@allovidange.tn" },
    update: {},
    create: {
      email: "admin@allovidange.tn",
      hashedPassword,
      name: "Admin ALLO VIDANGE",
    },
  });

  console.log("✅ Admin créé : admin@allovidange.tn / admin123");

  // ============================================================
  // BUSINESS SETTINGS
  // ============================================================
  await prisma.businessSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "ALLO VIDANGE",
      phone: null,         // À configurer dans les paramètres
      whatsappPhone: null, // À configurer dans les paramètres
      email: null,
      address: null,
      googleMapsUrl: null,
      appointmentDuration: 30,
      bufferTime: 0,
      minBookingNotice: 60,
      maxBookingHorizon: 30,
    },
  });

  console.log("✅ Paramètres métier créés");

  // ============================================================
  // BUSINESS HOURS
  // ============================================================
  const defaultHours = [
    { dayOfWeek: 0, isOpen: false, openTime: "08:00", closeTime: "18:00" }, // Dimanche
    { dayOfWeek: 1, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Lundi
    { dayOfWeek: 2, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Mardi
    { dayOfWeek: 3, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Mercredi
    { dayOfWeek: 4, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Jeudi
    { dayOfWeek: 5, isOpen: true,  openTime: "08:00", closeTime: "18:00" }, // Vendredi
    { dayOfWeek: 6, isOpen: true,  openTime: "08:00", closeTime: "13:00" }, // Samedi
  ];

  for (const hours of defaultHours) {
    await prisma.businessHours.upsert({
      where: { dayOfWeek: hours.dayOfWeek },
      update: {},
      create: hours,
    });
  }

  console.log("✅ Horaires d'ouverture créés");

  // ============================================================
  // SERVICES
  // ============================================================
  const services = [
    {
      name: "Vidange moteur",
      description: "Vidange complète avec remplacement de l'huile moteur selon les préconisations du constructeur.",
      duration: 30,
      price: null,
      color: "#C0101A",
      sortOrder: 1,
    },
    {
      name: "Vidange + Filtre à huile",
      description: "Vidange moteur avec remplacement du filtre à huile.",
      duration: 30,
      price: null,
      color: "#C0101A",
      sortOrder: 2,
    },
    {
      name: "Filtre à air",
      description: "Vérification et remplacement du filtre à air moteur.",
      duration: 20,
      price: null,
      color: "#3B82F6",
      sortOrder: 3,
    },
    {
      name: "Filtre habitacle",
      description: "Remplacement du filtre à air de l'habitacle (filtre à pollen).",
      duration: 15,
      price: null,
      color: "#3B82F6",
      sortOrder: 4,
    },
    {
      name: "Filtre carburant",
      description: "Remplacement du filtre carburant.",
      duration: 30,
      price: null,
      color: "#F59E0B",
      sortOrder: 5,
    },
    {
      name: "Contrôle des niveaux",
      description: "Vérification et appoint de tous les liquides : huile, liquide de frein, liquide de refroidissement, lave-glace.",
      duration: 15,
      price: null,
      color: "#22C55E",
      sortOrder: 6,
    },
    {
      name: "Entretien complet",
      description: "Vidange + remplacement des filtres huile, air, habitacle + contrôle des niveaux + contrôle pression pneus.",
      duration: 60,
      price: null,
      color: "#8B5CF6",
      sortOrder: 7,
    },
    {
      name: "Diagnostic électronique",
      description: "Lecture des codes défauts avec valise de diagnostic. Rapport détaillé fourni.",
      duration: 30,
      price: null,
      color: "#6B7280",
      sortOrder: 8,
    },
  ];

  const existingServicesCount = await prisma.service.count();
  if (existingServicesCount === 0) {
    for (const service of services) {
      await prisma.service.create({
        data: { ...service, id: `service-${service.sortOrder}` },
      });
    }
    console.log("✅ Services créés (premier démarrage)");
  } else {
    console.log(`⏭️  Services ignorés (${existingServicesCount} existants en base)`);
  }
  console.log("🎉 Seed terminé !");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Identifiants admin :");
  console.log("   Email    : admin@allovidange.tn");
  console.log("   Mot de passe : admin123");
  console.log("⚠️  CHANGEZ le mot de passe après la première connexion !");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
