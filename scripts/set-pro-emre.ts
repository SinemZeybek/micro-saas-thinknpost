import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.update({
    where: { email: "emredemirel4196@gmail.com" },
    data: { plan: "PRO" },
  });
  console.log("Updated", user.email, "to", user.plan);
  await prisma.$disconnect();
}

main();
