import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

const UpdateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  duration: z.number().int().min(5).max(480).optional(),
  price: z.number().int().min(0).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// PATCH /api/admin/services/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Données invalides" }, { status: 422 });
  }

  try {
    const service = await prisma.service.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
  }
}

// DELETE /api/admin/services/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.service.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
  }
}
