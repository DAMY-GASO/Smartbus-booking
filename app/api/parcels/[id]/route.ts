import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

interface Params {
  params: { id: string };
}

const updateSchema = z.object({
  status: z.enum(["RECEIVED", "IN_TRANSIT", "DELIVERED", "RETURNED"]).optional(),
});

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parcel = await prisma.parcel.findUnique({
    where: { id: params.id },
    include: { trip: { include: { route: true, bus: true } }, agent: { select: { name: true } } },
  });
  if (!parcel) return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
  return NextResponse.json({ parcel });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const parcel = await prisma.parcel.update({ where: { id: params.id }, data: result.data });
  return NextResponse.json({ parcel });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.parcel.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
