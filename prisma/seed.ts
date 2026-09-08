import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@smartbus.local";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const password = await bcrypt.hash("ChangeMe123!", 10);
    await prisma.user.create({
      data: {
        name: "SmartBus Admin",
        email: adminEmail,
        password,
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin account: ${adminEmail} / ChangeMe123!  (please change this password)`);
  } else {
    console.log("Admin account already exists — skipping seed.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
