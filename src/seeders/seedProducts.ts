import { connectDb } from "../config/db";
import { loadProductsFromFiles, upsertProducts } from "../utils/seeder";

const run = async () => {
  await connectDb();
  const products = await loadProductsFromFiles();
  await upsertProducts(products);
  process.stdout.write("Products seeded\n");
  process.exit(0);
};

void run();
