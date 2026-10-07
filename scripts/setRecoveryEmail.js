import mongoose from "mongoose";
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

const setRecoveryEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\nMongoDB connected successfully.\n");

    const loginEmail = (
      await question("Enter admin login email: ")
    )
      .trim()
      .toLowerCase();

    const recoveryEmail = (
      await question("Enter recovery email: ")
    )
      .trim()
      .toLowerCase();

    if (!loginEmail || !recoveryEmail) {
      console.log(
        "\nBoth emails are required."
      );

      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const admin = await Admin.findOne({
      email: loginEmail,
    });

    if (!admin) {
      console.log(
        "\nAdmin account not found."
      );

      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    admin.recoveryEmail = recoveryEmail;

    await admin.save();

    console.log("\n================================");
    console.log(
      "Recovery email updated successfully!"
    );
    console.log("================================");
    console.log(`Login Email: ${admin.email}`);
    console.log(
      `Recovery Email: ${admin.recoveryEmail}`
    );
    console.log("================================\n");

    rl.close();
    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "\nFailed to update recovery email:",
      error.message
    );

    rl.close();

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
};

setRecoveryEmail();