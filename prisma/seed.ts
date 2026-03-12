import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: "test@thinknpost.com" },
    update: {},
    create: {
      email: "test@thinknpost.com",
      name: "Test User",
      plan: "FREE",
    },
  });

  console.log("Created test user:", user.email);

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        userId: user.id,
        platform: "LINKEDIN",
        tone: "PROFESSIONAL",
        prompt: "AI trends in 2026",
        content:
          "The AI landscape in 2026 is shifting fast. Three trends every professional should watch: agentic workflows replacing manual processes, multimodal AI becoming the default, and AI-native companies outpacing traditional competitors. The question isn't whether to adopt — it's how fast you can adapt. #AI #FutureOfWork #Technology",
        orientation: "LANDSCAPE",
      },
    }),
    prisma.post.create({
      data: {
        userId: user.id,
        platform: "TWITTER",
        tone: "CASUAL",
        prompt: "Remote work tips",
        content:
          "hot take: the best remote work hack isn't a fancy desk setup — it's closing Slack for 2 hours straight and actually doing deep work 🧠\n\nyour notifications can wait. your focus can't.",
        orientation: "SQUARE",
      },
    }),
    prisma.post.create({
      data: {
        userId: user.id,
        platform: "INSTAGRAM",
        tone: "INSPIRATIONAL",
        prompt: "Startup journey motivation",
        content:
          "Building something from nothing isn't glamorous. It's late nights, self-doubt, and a hundred small decisions that nobody sees.\n\nBut every great product started as someone's crazy idea.\n\nKeep building. Keep shipping. The world needs what you're creating.\n\n#StartupLife #Entrepreneurship #BuildInPublic #Motivation",
        orientation: "PORTRAIT",
      },
    }),
  ]);

  console.log(`Created ${posts.length} sample posts`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
