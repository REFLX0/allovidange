import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
type AppointmentStatus = typeof VALID_STATUSES[number];

// Valid state machine transitions
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "NO_SHOW", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const StatusSchema = z.object({
  status: z.enum(VALID_STATUSES),
  cancelReason: z.string().max(500).optional(),
});

// PATCH /api/admin/appointments/[id]/status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = StatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 });
  }

  const { status: newStatus, cancelReason } = parsed.data;

  try {
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    const currentStatus = appt.status as AppointmentStatus;
    const allowed = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Transition de ${currentStatus} vers ${newStatus} non autorisée.` },
        { status: 400 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: newStatus,
        ...(cancelReason ? { cancelReason } : {}),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor: session.user.email ?? "admin",
        action: `APPOINTMENT_${newStatus}`,
        target: id,
        metadata: {
          previousStatus: currentStatus,
          newStatus,
          ...(cancelReason ? { cancelReason } : {}),
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[status]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
