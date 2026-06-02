import { connectDb } from "../config/db";
import { loadProductsFromFiles, upsertBrands, syncExistingProductBrands } from "../utils/seeder";

const run = async () => {
  await connectDb();
  const products = await loadProductsFromFiles();
  await upsertBrands(products);
  await syncExistingProductBrands();
  process.stdout.write("Brands seeded\n");
  process.exit(0);
};

void run();
