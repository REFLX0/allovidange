import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}

// PATCH /api/admin/appointments/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(body.internalNotes !== undefined ? { internalNotes: body.internalNotes } : {}),
        ...(body.cancelReason !== undefined ? { cancelReason: body.cancelReason } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
  }
}

// DELETE /api/admin/appointments/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  try {
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
  }
}
