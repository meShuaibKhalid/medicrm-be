import { app } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

const start = async () => {
  await connectDb();
  app.listen(env.PORT, () => {
    process.stdout.write(`Server running on port ${env.PORT}\n`);
  });
};

void start();
