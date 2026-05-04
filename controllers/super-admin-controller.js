import Client from "../models/Client.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";


export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate("admins", "name email")
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
  const { cafeName, planType, expiryDate, admins } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

 try {
    const newClient = new Client({
      cafeName,
      planType,
      expiryDate: new Date(expiryDate),
      subscriptionStatus: "active",
      admins: [] 
    });

    const savedClient = await newClient.save({ session });
    const adminIds = [];


    for (const admin of admins) {
      const normalizedEmail = admin.email.toLowerCase();
      const userExists = await User.findOne({ email: normalizedEmail });
      
      if (userExists) {
        throw new Error(`Email ${admin.email} is already in use.`);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);

      const newUser = await User.create([{
        name: admin.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin",
        tenantId: savedClient._id,
      }], { session });

      adminIds.push(newUser[0]._id);
    }

    savedClient.admins = adminIds;
    await savedClient.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: "Cafe and admins onboarded successfully" });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  }finally{
    session.endSession();
  }
};

export const updateCafe = async (req, res) => {
  const { id } = req.params;
  const { cafeName, planType, expiryDate, admins } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const client = await Client.findById(id);
    if (!client) throw new Error("Cafe not found");

    client.cafeName = cafeName || client.cafeName;
    client.planType = planType || client.planType;
    client.expiryDate = expiryDate ? new Date(expiryDate) : client.expiryDate;

    const newAdminIds = [];

    for (const admin of admins) {
      const normalizedEmail = admin.email.toLowerCase();
      let user = await User.findOne({ email: normalizedEmail });

      if (user) {

        if (user.tenantId && user.tenantId.toString() !== id && user.role !== 'superadmin') {
          throw new Error(`Email ${admin.email} is already associated with another cafe.`);
        }
        

        user.name = admin.name;
        if (admin.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(admin.password, salt);
        }
        await user.save({ session });
        newAdminIds.push(user._id);
      } else {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password || "Default123!", salt);
        
        const newUser = await User.create([{
          name: admin.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "admin",
          tenantId: client._id,
        }], { session });
        
        newAdminIds.push(newUser[0]._id);
      }
    }


    client.admins = newAdminIds;
    await client.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: "Cafe updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};


export const toggleSuspendCafe = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await Client.findById(id);
    if (!client) return res.status(404).json({ message: "Cafe not found" });

    client.subscriptionStatus = client.subscriptionStatus === "suspended" ? "active" : "suspended";
    await client.save();

    res.status(200).json({ 
      message: `Cafe ${client.subscriptionStatus === "suspended" ? 'suspended' : 'activated'} successfully`,
      status: client.subscriptionStatus 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCafe = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const client = await Client.findById(id);
    if (!client) throw new Error("Cafe not found");

    await User.deleteMany({ tenantId: id }, { session });

    await Client.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    res.status(200).json({ message: "Cafe and all associated accounts deleted permanently" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};