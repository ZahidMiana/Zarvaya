import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import Counter from "@/models/Counter";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

dotenv.config({ path: ".env.local", override: true });
dotenv.config();

type DiffIndexesResult = {
  toCreate?: unknown[];
  toDrop?: unknown[];
};

async function getIndexDiff(model: typeof mongoose.Model): Promise<DiffIndexesResult | null> {
  const target = model as unknown as { diffIndexes?: () => Promise<DiffIndexesResult> };
  if (typeof target.diffIndexes !== "function") {
    return null;
  }

  return target.diffIndexes();
}

function assertRecentBackupVerification(): void {
  const value = process.env.MONGODB_BACKUP_VERIFIED_AT;
  if (!value) {
    throw new Error("MONGODB_BACKUP_VERIFIED_AT is missing.");
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("MONGODB_BACKUP_VERIFIED_AT is invalid. Use ISO date format.");
  }

  const ageDays = (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays > 45) {
    throw new Error("Backup verification is stale. Re-verify backup policy and update MONGODB_BACKUP_VERIFIED_AT.");
  }
}

async function run(): Promise<void> {
  console.log("Data readiness check started...");
  await connectDB();

  assertRecentBackupVerification();

  const models = [
    { name: "Product", model: Product },
    { name: "Order", model: Order },
    { name: "User", model: User },
    { name: "BlogPost", model: BlogPost },
    { name: "Counter", model: Counter },
  ];

  for (const item of models) {
    await item.model.createCollection().catch(() => undefined);
    await item.model.syncIndexes();

    const indexes = await item.model.collection.indexes();
    const diff = await getIndexDiff(item.model as unknown as typeof mongoose.Model);
    const pendingCreates = diff?.toCreate?.length ?? 0;
    const pendingDrops = diff?.toDrop?.length ?? 0;

    console.log(
      `[${item.name}] indexes=${indexes.length} pendingCreates=${pendingCreates} pendingDrops=${pendingDrops}`,
    );

    if (pendingCreates > 0 || pendingDrops > 0) {
      throw new Error(`${item.name} has pending index changes. Run index sync before deployment.`);
    }
  }

  console.log("Data readiness check passed.");
}

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Data readiness check failed:", error instanceof Error ? error.message : error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
