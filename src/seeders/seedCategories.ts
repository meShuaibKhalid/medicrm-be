import { connectDb } from "../config/db";
import { loadCategoryTree, walkCategories } from "../utils/seeder";

const run = async () => {
  await connectDb();
  const tree = await loadCategoryTree();
  await walkCategories(tree);
  process.stdout.write("Categories seeded\n");
  process.exit(0);
};

void run();
