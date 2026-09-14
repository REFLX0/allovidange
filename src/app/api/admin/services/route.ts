import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

const ServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  duration: z.number().int().min(5).max(480),
  price: z.number().int().min(0).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#C0101A"),
  isActive: z.boolean().default(true),
});

// GET /api/admin/services
export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(services);
}

// POST /api/admin/services
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = ServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Données invalides" }, { status: 422 });
  }

  const maxOrder = await prisma.service.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  const service = await prisma.service.create({
    data: { ...parsed.data, sortOrder: nextOrder },
  });

  return NextResponse.json(service, { status: 201 });
}
