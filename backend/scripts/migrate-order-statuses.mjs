/**
 * One-time migration: map old orderStatus values to Pending | Processing | Ready.
 * Run from backend folder: npm run migrate:order-statuses
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI is not set in .env");
  process.exit(1);
}

await mongoose.connect(uri);
const col = mongoose.connection.collection("orders");

const r1 = await col.updateMany(
  { orderStatus: { $in: ["Shipped", "Delivered"] } },
  { $set: { orderStatus: "Ready" } }
);
const r2 = await col.updateMany({ orderStatus: "Cancelled" }, { $set: { orderStatus: "Pending" } });

console.log("Updated Shipped/Delivered → Ready:", r1.modifiedCount);
console.log("Updated Cancelled → Pending:", r2.modifiedCount);

await mongoose.disconnect();
process.exit(0);
