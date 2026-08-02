import app from "./app";
import { config } from "./config";
import { prisma } from "./prisma";

async function main() {
  await prisma.$connect();
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
