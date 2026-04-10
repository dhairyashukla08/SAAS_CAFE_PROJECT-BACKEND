import Cafe from "../models/Cafe.js";

export const checkCafeStatus = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "superadmin") {
      return next();
    }
    if (!req.cafeId) {
      return res.status(400).json({ message: "No cafe associated with this account." });
    }

    const cafe = await Cafe.findById(req.cafeId); 

    if (!cafe) return res.status(404).json({ message: "Cafe account not found." });

    if (cafe.status === "Suspended") {
      return res.status(403).json({ 
        message: "Your access has been suspended. Please contact the administrator for payment." 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Status check failed", error: error.message });
  }
};