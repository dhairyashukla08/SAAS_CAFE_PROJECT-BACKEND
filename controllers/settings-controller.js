import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ tenantId: req.user.tenantId });
    if (!settings) {
      settings = await Settings.create({ tenantId: req.user.tenantId });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { tenantId } = req.user;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from user session." });
    }

    const { 
      requireLocation, orderRadius, allowTableChange, 
      paymentEnabled, numberOfTables, cafeLatitude, cafeLongitude 
    } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { tenantId },
      { 
        requireLocation, orderRadius, allowTableChange, 
        paymentEnabled, numberOfTables, cafeLatitude, cafeLongitude 
      }, 
      { new: true, upsert: true, runValidators: true }
    );
    // if (settings) {
    //   settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
    //     new: true,
    //   });
    // } else {
    //   settings = await Settings.create(req.body);
    // }

    const io = req.io || req.app.get("socketio");
    if (io) {
      io.to(`admin_${tenantId}`).emit("settingsUpdate", settings);
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
