import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const months: { start: Date; end: Date; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ start, end, label: MONTH_LABELS[start.getMonth()] });
  }

  const results = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const [bookingSum, parcelSum] = await Promise.all([
        prisma.booking.aggregate({
          where: { createdAt: { gte: start, lt: end }, status: { not: "CANCELLED" } },
          _sum: { amountPaid: true },
        }),
        prisma.parcel.aggregate({
          where: { createdAt: { gte: start, lt: end }, status: { not: "RETURNED" } },
          _sum: { fee: true },
        }),
      ]);
      const amount = (bookingSum._sum.amountPaid ?? 0) + (parcelSum._sum.fee ?? 0);
      return { month: label, amount };
    })
  );

  return NextResponse.json({ months: results });
}
