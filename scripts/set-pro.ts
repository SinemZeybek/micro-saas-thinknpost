import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.user.update({ where: { id: user.id }, data: { plan: "PRO" } });
    console.log(`Updated ${user.email} to PRO`);
  } else {
    console.log("No users found");
  }
  await prisma.$disconnect();
}

main();
