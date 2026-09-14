import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailabilitySummaryForRange } from "@/lib/availability";
import { startOfMonth, endOfMonth } from "date-fns";
import { DEFAULT_SERVICES } from "@/lib/services";

// GET /api/public/availability/summary?year=2026&month=9&serviceId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") ?? "");
    const month = parseInt(searchParams.get("month") ?? "");
    const serviceId = searchParams.get("serviceId");

    if (!serviceId || isNaN(year) || isNaN(month)) {
      return NextResponse.json({ error: "year, month, serviceId required" }, { status: 400 });
    }

    const monthDate = new Date(year, month - 1, 1);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    let service: { duration: number } | null = null;
    let settings: { bufferTime: number; minBookingNotice: number } | null = null;
    let businessHours: Array<{ dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }> = [];
    let blockedPeriods: Array<{ startDate: Date; endDate: Date }> = [];
    let appointments: Array<{ startTime: Date; endTime: Date }> = [];

    try {
      const [dbService, dbSettings, dbHours, dbBlocked, dbAppts] = await Promise.all([
        prisma.service.findUnique({ where: { id: serviceId } }),
        prisma.businessSettings.findUnique({ where: { id: "singleton" } }),
        prisma.businessHours.findMany(),
        prisma.blockedPeriod.findMany({
          where: {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        }),
        prisma.appointment.findMany({
          where: {
            date: { gte: start, lte: end },
            status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
          },
          select: { startTime: true, endTime: true },
        }),
      ]);

      if (dbService) service = dbService;
      if (dbSettings) settings = dbSettings;
      if (dbHours && dbHours.length > 0) businessHours = dbHours;
      if (dbBlocked) blockedPeriods = dbBlocked;
      if (dbAppts) appointments = dbAppts;
    } catch {
      // DB offline
    }

    if (!service) {
      const def = DEFAULT_SERVICES.find((s) => s.id === serviceId);
      if (def) {
        service = { duration: def.duration };
      } else {
        service = { duration: 30 };
      }
    }

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

    const summary = getAvailabilitySummaryForRange(
      start,
      end,
      businessHours,
      blockedPeriods,
      appointments,
      service.duration,
      settings?.bufferTime ?? 0,
      settings?.minBookingNotice ?? 60
    );

    return NextResponse.json(summary);
  } catch (err) {
    console.error("[availability summary GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
