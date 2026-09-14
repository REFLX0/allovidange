import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { settings, businessHours } = body;

  try {
    await prisma.businessSettings.upsert({
      where: { id: "singleton" },
      update: {
        businessName: settings.businessName,
        phone: settings.phone || null,
        whatsappPhone: settings.whatsappPhone || null,
        email: settings.email || null,
        address: settings.address || null,
        googleMapsUrl: settings.googleMapsUrl || null,
        appointmentDuration: settings.appointmentDuration,
        bufferTime: settings.bufferTime,
        minBookingNotice: settings.minBookingNotice,
        maxBookingHorizon: settings.maxBookingHorizon,
      },
      create: {
        id: "singleton",
        businessName: settings.businessName || "ALLO VIDANGE",
        phone: settings.phone || null,
        whatsappPhone: settings.whatsappPhone || null,
        email: settings.email || null,
        address: settings.address || null,
        googleMapsUrl: settings.googleMapsUrl || null,
        appointmentDuration: settings.appointmentDuration || 30,
        bufferTime: settings.bufferTime || 0,
        minBookingNotice: settings.minBookingNotice || 60,
        maxBookingHorizon: settings.maxBookingHorizon || 30,
      },
    });

    // Upsert each day's hours
    if (Array.isArray(businessHours)) {
      for (const hour of businessHours) {
        await prisma.businessHours.upsert({
          where: { dayOfWeek: hour.dayOfWeek },
          update: {
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
          create: {
            dayOfWeek: hour.dayOfWeek,
            isOpen: hour.isOpen,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[settings]", err);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde." }, { status: 500 });
  }
}
