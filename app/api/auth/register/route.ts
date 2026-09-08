import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { hashPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  // The very first account created becomes an ADMIN; everyone after is an AGENT
  // (an admin can promote users later from Settings/User management).
  const userCount = await prisma.user.count();
  const role = userCount === 0 ? "ADMIN" : "AGENT";

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: passwordHash, role },
  });

  const token = await signSession({ userId: user.id, name: user.name, email: user.email, role: user.role });
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions);

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
