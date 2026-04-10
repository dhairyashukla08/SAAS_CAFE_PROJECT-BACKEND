// seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js"; 

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("🌱 Connected to MongoDB for seeding...");

    const adminEmail = "superadmin@bluecup.com"; 
    await User.deleteMany({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt); 

    const superAdmin = new User({
      name: "Dhairya SuperAdmin",
      email: adminEmail,
      password: hashedPassword,
      role: "superadmin",
    });

    await superAdmin.save();
    
    console.log("✅ Super Admin created successfully!");
    console.log("📧 Email: superadmin@bluecup.com");
    console.log("🔑 Password: admin123");
    
    process.exit(); 
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedSuperAdmin();