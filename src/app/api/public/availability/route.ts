import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";
import { DEFAULT_SERVICES } from "@/lib/services";

// GET /api/public/availability?date=YYYY-MM-DD&serviceId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!dateStr || !serviceId) {
      return NextResponse.json({ error: "date and serviceId required" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    let service: { duration: number } | null = null;
    let settings: { bufferTime: number; minBookingNotice: number } | null = null;
    let businessHours: Array<{ dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }> = [];
    let blockedPeriods: Array<{ startDate: Date; endDate: Date }> = [];
    let existingAppointments: Array<{ startTime: Date; endTime: Date }> = [];

    try {
      const [dbService, dbSettings, dbHours, dbBlocked, dbAppts] = await Promise.all([
        prisma.service.findUnique({ where: { id: serviceId } }),
        prisma.businessSettings.findUnique({ where: { id: "singleton" } }),
        prisma.businessHours.findMany(),
        prisma.blockedPeriod.findMany({
          where: {
            startDate: { lte: date },
            endDate: { gte: date },
          },
        }),
        prisma.appointment.findMany({
          where: {
            date: date,
            status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
          },
          select: { startTime: true, endTime: true },
        }),
      ]);

      if (dbService) service = dbService;
      if (dbSettings) settings = dbSettings;
      if (dbHours && dbHours.length > 0) businessHours = dbHours;
      if (dbBlocked) blockedPeriods = dbBlocked;
      if (dbAppts) existingAppointments = dbAppts;
    } catch {
      // DB offline or not seeded
    }

    // Fallback service
    if (!service) {
      const def = DEFAULT_SERVICES.find((s) => s.id === serviceId);
      if (def) {
        service = { duration: def.duration };
      } else {
        service = { duration: 30 };
      }
    }

    // Fallback business hours (Lun-Ven 8h-18h, Sam 8h-13h, Dimanche fermé)
    if (businessHours.length === 0) {
      businessHours = [
        { dayOfWeek: 0, isOpen: false, openTime: "08:00", closeTime: "18:00" },
        { dayOfWeek: 1, isOpen: true,  openTime: "08:00", closeTime: "18:00" },
        { dayOfWeek: 2, isOpen: true,  openTime: "08:00", closeTime: "18:00" },
        { dayOfWeek: 3, isOpen: true,  openTime: "08:00", closeTime: "18:00" },
        { dayOfWeek: 4, isOpen: true,  openTime: "08:00", closeTime: "18:00" },
        { dayOfWeek: 5, isOpen: true,  openTime: "08:00", closeTime: "18:00" },
        { dayOfWeek: 6, isOpen: true,  openTime: "08:00", closeTime: "13:00" },
      ];
    }

    const slots = getAvailableSlots({
      date,
      businessHours,
      blockedPeriods,
      existingAppointments,
      serviceDuration: service.duration,
      bufferMinutes: settings?.bufferTime ?? 0,
      minNoticeMinutes: settings?.minBookingNotice ?? 60,
    });

    return NextResponse.json(slots);
  } catch (err) {
    console.error("[availability GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
