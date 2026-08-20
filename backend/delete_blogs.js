const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Suppression de tous les articles de blog...");
  
  const deleted = await prisma.blogPost.deleteMany({});
  
  console.log(`✅ ${deleted.count} articles de blog ont été supprimés avec succès.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
