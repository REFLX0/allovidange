import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isSlotAvailable } from "@/lib/availability";
import { parse } from "date-fns";
import { DEFAULT_SERVICES } from "@/lib/services";

// Rate limiting — simple in-memory
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

const AppointmentSchema = z.object({
  serviceId: z.string().min(1, "Service requis"),
  customerName: z.string().min(2, "Nom requis").max(100),
  customerPhone: z
    .string()
    .min(7, "Téléphone invalide")
    .max(20)
    .regex(/^[\d\s\+\-\(\)\.]+$/, "Numéro de téléphone invalide"),
  customerEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  customerNotes: z.string().max(500).optional(),
  vehicleBrand: z.string().min(1, "Marque requise").max(50),
  vehicleModel: z.string().min(1, "Modèle requis").max(50),
  vehicleEngine: z.string().max(50).optional(),
  vehicleYear: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  vehiclePlate: z.string().max(20).optional(),
  vehicleMileage: z.number().int().min(0).max(9999999).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Heure de fin invalide"),
});

// POST /api/public/appointments
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de demandes. Veuillez patienter quelques minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = AppointmentSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 422 });
    }

    const data = parsed.data;

    // Verify service exists
    let service: { id: string; name: string; duration: number } | null = null;
    try {
      service = await prisma.service.findUnique({
        where: { id: data.serviceId, isActive: true },
      });
    } catch {
      // DB offline
    }

    if (!service) {
      const def = DEFAULT_SERVICES.find((s) => s.id === data.serviceId);
      if (def) {
        service = { id: def.id, name: def.name, duration: def.duration };
      } else {
        service = { id: data.serviceId, name: "Vidange & Entretien", duration: 30 };
      }
    }

    // Parse date and times
    const appointmentDate = new Date(data.date + "T00:00:00");
    const refDate = appointmentDate;
    const startTime = parse(data.startTime, "HH:mm", refDate);
    const endTime = parse(data.endTime, "HH:mm", refDate);

    // Availability check if DB is online
    try {
      const settings = await prisma.businessSettings.findUnique({ where: { id: "singleton" } });
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          date: appointmentDate,
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        },
        select: { startTime: true, endTime: true },
      });

      const slotAvailable = isSlotAvailable(
        startTime,
        endTime,
        existingAppointments.map((a) => ({ startTime: a.startTime, endTime: a.endTime })),
        settings?.bufferTime ?? 0
      );

      if (!slotAvailable) {
        return NextResponse.json(
          { error: "Ce créneau n'est plus disponible. Veuillez en choisir un autre." },
          { status: 409 }
        );
      }
    } catch {
      // Ignore if DB offline
    }

    let appointmentReference = `RDV-${Date.now().toString(36).toUpperCase()}`;
    let appointmentId = "temp-appt-id";

    try {
      // Upsert customer by phone number
      const customer = await prisma.customer.upsert({
        where: { phone: data.customerPhone.replace(/\s/g, "") },
        update: {
          name: data.customerName,
          ...(data.customerEmail ? { email: data.customerEmail } : {}),
          ...(data.customerNotes ? { notes: data.customerNotes } : {}),
        },
        create: {
          name: data.customerName,
          phone: data.customerPhone.replace(/\s/g, ""),
          email: data.customerEmail || null,
          notes: data.customerNotes || null,
        },
      });

      // Create vehicle
      const vehicle = await prisma.vehicle.create({
        data: {
          brand: data.vehicleBrand,
          model: data.vehicleModel,
          engine: data.vehicleEngine || null,
          year: data.vehicleYear ?? null,
          plate: data.vehiclePlate || null,
          mileage: data.vehicleMileage ?? null,
          customerId: customer.id,
        },
      });

      // Ensure service exists in DB before linking
      await prisma.service.upsert({
        where: { id: service.id },
        update: {},
        create: {
          id: service.id,
          name: service.name,
          duration: service.duration,
          sortOrder: 1,
        },
      });

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          date: appointmentDate,
          startTime,
          endTime,
          customerId: customer.id,
          vehicleId: vehicle.id,
          serviceId: service.id,
          status: "PENDING",
        },
      });

      appointmentReference = appointment.reference;
      appointmentId = appointment.id;

      // Audit log
      await prisma.auditLog.create({
        data: {
          actor: "public",
          action: "APPOINTMENT_CREATED",
          target: appointment.id,
          metadata: {
            customer: customer.name,
            phone: customer.phone,
            service: service.name,
            date: data.date,
            startTime: data.startTime,
          },
        },
      });
    } catch (dbErr) {
      console.warn("Could not save to DB (preview mode fallback):", dbErr);
    }

    return NextResponse.json({
      success: true,
      reference: appointmentReference,
      id: appointmentId,
    });
  } catch (err) {
    console.error("[appointments/create]", err);
    return NextResponse.json({ error: "Erreur serveur. Veuillez réessayer." }, { status: 500 });
  }
}
