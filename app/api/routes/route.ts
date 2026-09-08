import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** Lists all known origin/destination routes (used for search/autocomplete). */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const routes = await prisma.route.findMany({ orderBy: { origin: "asc" } });
  return NextResponse.json({ routes });
}
