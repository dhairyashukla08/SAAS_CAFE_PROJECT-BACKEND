import Cafe from "../models/Cafe.js";
export const getAllCafes=async(req,res)=>{
    try {
    const cafes = await Cafe.find().select("-password"); 
    res.status(200).json(cafes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cafes" });
  }
};

export const toggleCafeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const cafe = await Cafe.findById(id);
    
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    cafe.status = cafe.status === "Active" ? "Suspended" : "Active";
    await cafe.save();

    res.status(200).json({ 
      message: `Cafe ${cafe.name} is now ${cafe.status}`, 
      status: cafe.status 
    });
  } catch (error) {
    res.status(500).json({ message: "Toggle failed" });
  }
};