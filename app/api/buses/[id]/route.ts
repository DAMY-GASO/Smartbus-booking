import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { busSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth";

interface Params {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bus = await prisma.bus.findUnique({ where: { id: params.id } });
  if (!bus) return NextResponse.json({ error: "Bus not found" }, { status: 404 });
  return NextResponse.json({ bus });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = busSchema.partial().safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const bus = await prisma.bus.update({ where: { id: params.id }, data: result.data });
  return NextResponse.json({ bus });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.bus.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
