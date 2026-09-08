import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalTrips, totalBookings, totalParcels, activeBuses, bookingRevenue, parcelRevenue] = await Promise.all([
    prisma.trip.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } } }),
    prisma.parcel.count({ where: { createdAt: { gte: startOfMonth }, status: { not: "RETURNED" } } }),
    prisma.bus.count({ where: { active: true } }),
    prisma.booking.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
      _sum: { amountPaid: true },
    }),
    prisma.parcel.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: { not: "RETURNED" } },
      _sum: { fee: true },
    }),
  ]);

  const totalRevenue = (bookingRevenue._sum.amountPaid ?? 0) + (parcelRevenue._sum.fee ?? 0);

  return NextResponse.json({
    totalTrips,
    totalBookings,
    totalParcels,
    totalRevenue,
    activeBuses,
  });
}
