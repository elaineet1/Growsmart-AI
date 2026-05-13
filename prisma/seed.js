// prisma/seed.js
// Run: npm run db:seed
// Creates a demo client for testing

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const demo = await prisma.client.upsert({
    where: { email: "demo@growsmart.sg" },
    update: {},
    create: {
      email: "demo@growsmart.sg",
      name: "Demo User",
      company: "GrowSmart AI",
      passwordHash,
      isActive: true,
      plan: "pro",
    },
  });

  console.log("✅ Seed complete. Demo client created:");
  console.log(`   Email:    ${demo.email}`);
  console.log(`   Password: password123`);
  console.log(`   Plan:     ${demo.plan}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
