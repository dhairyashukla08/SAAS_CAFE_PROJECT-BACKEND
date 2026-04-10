import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
      });
    } else {
      settings = await Settings.create(req.body);
    }

    const io = req.io || req.app.get("socketio");
    if (io) {
      io.emit("settingsUpdate", settings);
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
