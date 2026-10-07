import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "readline";

import Admin from "../models/Admin.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) => {
  return new Promise((resolve) => {
    rl.question(text, resolve);
  });
};

const setAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\nMongoDB connected successfully.\n");

    const email = (
      await question("Enter admin email: ")
    )
      .trim()
      .toLowerCase();

    const password = await question(
      "Enter new admin password: "
    );

    if (!email || !password) {
      console.log(
        "\nEmail and password are required."
      );

      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    if (password.length < 8) {
      console.log(
        "\nPassword must be at least 8 characters."
      );

      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const admin = await Admin.findOne({
      email,
    });

    if (!admin) {
      console.log(
        "\nNo admin account found with this email."
      );

      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    admin.passwordHash = passwordHash;
    admin.isActive = true;

    admin.tokenVersion =
      (admin.tokenVersion || 0) + 1;

    await admin.save();

    console.log("\n================================");
    console.log("Admin password updated successfully!");
    console.log("================================");
    console.log(`Email: ${admin.email}`);
    console.log("Password: [hidden]");
    console.log("================================\n");

    rl.close();
    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "\nFailed to update admin password:",
      error.message
    );

    rl.close();

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
};

setAdminPassword();