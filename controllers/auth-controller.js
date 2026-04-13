import User from "../models/User.js";
import Client from "../models/Client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const token = jwt.sign({ id: user._id , role: user.role}, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res
      .status(201)
      .json({ token, admin: {id: user._id, name: user.name, email: user.email, role: user.role,tenantId: user.tenantId } });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });
    let cafeName = null;
    if (user.tenantId) {
      const cafe = await Client.findById(user.tenantId);
      cafeName = cafe ? cafe.cafeName : null;
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
     return res.json({ token, admin: {id: user._id, name: user.name, email: user.email , role: user.role,tenantId: user.tenantId,cafeName: cafeName} });
  } catch (error) {
    console.error("Login Error:", error);
     return res.status(500).send("Server error");
  }
};
