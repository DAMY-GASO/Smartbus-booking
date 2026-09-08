import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

interface Params {
  params: { id: string };
}

const updateSchema = z.object({
  status: z.enum(["SCHEDULED", "IN_TRANSIT", "COMPLETED", "CANCELLED"]).optional(),
  fare: z.coerce.number().positive().optional(),
  departureAt: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: { bus: true, route: true, bookings: true, parcels: true },
  });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ trip });
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

  const { departureAt, ...rest } = result.data;
  const trip = await prisma.trip.update({
    where: { id: params.id },
    data: { ...rest, ...(departureAt ? { departureAt: new Date(departureAt) } : {}) },
    include: { bus: true, route: true },
  });

  return NextResponse.json({ trip });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.trip.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
