import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parcelSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parcels = await prisma.parcel.findMany({
    include: { trip: { include: { route: true, bus: true } }, agent: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ parcels });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = parcelSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const trip = await prisma.trip.findUnique({ where: { id: result.data.tripId } });
  if (!trip) {
    return NextResponse.json({ error: "Selected trip was not found." }, { status: 404 });
  }

  const parcel = await prisma.parcel.create({
    data: { ...result.data, agentId: session.userId },
    include: { trip: { include: { route: true, bus: true } } },
  });

  return NextResponse.json({ parcel }, { status: 201 });
}
