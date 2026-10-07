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

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\nMongoDB connected.\n");

    const email = (
      await question("Enter admin email: ")
    )
      .trim()
      .toLowerCase();

    const password = await question(
      "Enter admin password: "
    );

    const name = (
      await question("Enter admin name: ")
    ).trim();

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

    const existingAdmin = await Admin.findOne({
      email,
    });

    if (existingAdmin) {
      console.log(
        "\nAn admin with this email already exists."
      );

      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const admin = await Admin.create({
      email,
      passwordHash,
      name,
      isActive: true,
      tokenVersion: 0,
    });

    console.log("\n================================");
    console.log("Admin created successfully!");
    console.log("================================");
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log("Password: [hidden]");
    console.log("================================\n");

    rl.close();
    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "\nFailed to create admin:",
      error.message
    );

    rl.close();

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
};

createAdmin();