import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tripSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trips = await prisma.trip.findMany({
    include: { bus: true, route: true, bookings: { select: { id: true, status: true } } },
    orderBy: { departureAt: "desc" },
  });

  // Derive available seats (capacity minus non-cancelled bookings) for each trip.
  const withAvailability = trips.map((trip) => {
    const takenSeats = trip.bookings.filter((b) => b.status !== "CANCELLED").length;
    return {
      ...trip,
      seatsAvailable: Math.max(trip.bus.capacity - takenSeats, 0),
      bookings: undefined,
    };
  });

  return NextResponse.json({ trips: withAvailability });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = tripSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { busId, origin, destination, departureAt, fare } = result.data;

  const bus = await prisma.bus.findUnique({ where: { id: busId } });
  if (!bus) {
    return NextResponse.json({ error: "Selected bus was not found." }, { status: 404 });
  }

  // Find an existing route with the same origin/destination, or create one.
  let route = await prisma.route.findFirst({ where: { origin, destination } });
  if (!route) {
    route = await prisma.route.create({ data: { origin, destination } });
  }

  const trip = await prisma.trip.create({
    data: {
      busId,
      routeId: route.id,
      departureAt: new Date(departureAt),
      fare,
    },
    include: { bus: true, route: true },
  });

  return NextResponse.json({ trip }, { status: 201 });
}
