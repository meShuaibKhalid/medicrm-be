import cors from "cors";
import express from "express";
import morgan from "morgan";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import brandRoutes from "./routes/brandRoutes";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import addressRoutes from "./routes/addressRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { errorResponse, successResponse } from "./utils/response";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json(successResponse("Done", { status: "ok" }));
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json(errorResponse("Route not found"));
});

app.use(errorHandler);
