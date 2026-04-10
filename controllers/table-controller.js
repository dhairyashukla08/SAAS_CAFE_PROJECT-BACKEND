import Table from "../models/Table.js";

export const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addTable = async (req, res) => {
  const table = new Table({ tableNumber: req.body.tableNumber });
  try {
    const newTable = await table.save();
    res.status(201).json(newTable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyTable = async (req, res) => {
  const { table, token } = req.body;
  if (token !== "SECRET_RESTO_TOKEN") {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }

  try {
    const existingTable = await Table.findOne({ tableNumber: table });

    if (!existingTable) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }
    res.json({
      success: true,
      table: existingTable.tableNumber,
      sessionToken: "optional-jwt-token",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
