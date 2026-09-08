import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { bookingSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    include: { trip: { include: { route: true, bus: true } }, agent: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookings });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = bookingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { tripId, seatNumber } = result.data;

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { bus: true } });
  if (!trip) {
    return NextResponse.json({ error: "Selected trip was not found." }, { status: 404 });
  }
  if (trip.status === "CANCELLED" || trip.status === "COMPLETED") {
    return NextResponse.json({ error: `This trip is ${trip.status.toLowerCase()} and can no longer accept bookings.` }, { status: 409 });
  }
  if (seatNumber > trip.bus.capacity) {
    return NextResponse.json({ error: `This bus only has ${trip.bus.capacity} seats.` }, { status: 422 });
  }

  try {
    const booking = await prisma.booking.create({
      data: { ...result.data, agentId: session.userId },
      include: { trip: { include: { route: true, bus: true } } },
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: `Seat ${seatNumber} is already booked on this trip.` }, { status: 409 });
    }
    throw error;
  }
}
