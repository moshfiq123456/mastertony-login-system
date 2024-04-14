import express from "express";
import { config } from "dotenv";
import cors from "cors"; // Import the cors middleware
import dbConnect from "./dbConnect.js";
import authRoutes from "./routes/auth.js";
import bcrypt from "bcrypt";
import refreshTokenRoutes from "./routes/refreshToken.js";
import userRoutes from "./routes/users.js";
import User from "./models/User.js";

const app = express();

config();
dbConnect();

app.use(express.json());

// Use CORS middleware
app.use(cors("*"));

app.use("/api", authRoutes);
app.use("/api/refreshToken", refreshTokenRoutes);
app.use("/api/users", userRoutes);

const port = process.env.PORT || 8080;
const salt = await bcrypt.genSalt(Number(process.env.SALT));
const hashPassword = await bcrypt.hash("Admin@12345", salt);
// Check for the existence of a super admin user during startup
async function createDefaultSuperAdmin() {
  const superAdmin = await User.findOne({ roles: "super_admin" });
  if (!superAdmin) {
    // Create the default super admin user
    await User.create({
      userName: "admin",
      email: "admin@gmail.com",
      password: hashPassword,
      roles: "super_admin",
    });
  }
}
app.listen(port, async () => {
  await createDefaultSuperAdmin();
  console.log(`Listening on port ${port}...`);
});
