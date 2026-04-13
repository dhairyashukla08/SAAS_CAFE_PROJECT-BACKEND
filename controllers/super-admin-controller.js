import Client from "../models/Client.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";


export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate("adminUser", "name email")
      .sort({ createdAt: -1 });

    const stats = {
      totalClients: clients.length,
      activeSubscriptions: clients.filter((c) => c.subscriptionStatus === "active").length,
      monthlyRevenue: 0, 
    };

    res.status(200).json({ clients, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const onboardNewCafe = async (req, res) => {
  const { cafeName, adminName, adminEmail, password, planType, expiryDate } = req.body;

  try {
    const normalizedEmail = adminEmail.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "Admin email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = new mongoose.Types.ObjectId();

    const newClient = new Client({
      cafeName,
      planType,
      expiryDate: new Date(expiryDate),
      subscriptionStatus: "active",
      adminUser: userId,
    });

    const savedClient = await newClient.save();

    const newUser = await User.create({
        _id: userId,
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      tenantId: savedClient._id,
    });

    res.status(201).json({
      message: "Cafe onboarded successfully",
      client: {
        id: savedClient._id,
        cafeName: savedClient.cafeName,
        adminUser: newUser.email
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};