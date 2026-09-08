import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { busSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const buses = await prisma.bus.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ buses });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = busSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const existing = await prisma.bus.findUnique({ where: { plateNumber: result.data.plateNumber } });
  if (existing) {
    return NextResponse.json({ error: "A bus with this plate number already exists." }, { status: 409 });
  }

  const bus = await prisma.bus.create({ data: result.data });
  return NextResponse.json({ bus }, { status: 201 });
}
