import Table from "../models/Table.js";
import Client from "../models/Client.js";
import Settings from "../models/Settings.js";

export const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({ tenantId: req.user.tenantId }).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addTable = async (req, res) => {
   try {

  const settings = await Settings.findOne({ tenantId: req.user.tenantId });
  const maxTables = settings?.numberOfTables || 10;

  const currentCount = await Table.countDocuments({ tenantId: req.user.tenantId });
    if (currentCount >= maxTables) {
      return res.status(400).json({ 
        message: `Table limit reached. You can only have ${maxTables} tables. Update your limit in Settings.` 
      });
    }

  const table = new Table({ tableNumber: req.body.tableNumber, tenantId: req.user.tenantId });

    const newTable = await table.save();
    res.status(201).json(newTable);

  } catch (err) {

    res.status(400).json({ message: "Table number already exists for your cafe" });
  }
};

export const verifyTable = async (req, res) => {
  const { table, token, tenantId } = req.body;
  if (token !== "SECRET_RESTO_TOKEN") {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }

  try {
    const existingTable = await Table.findOne({ tableNumber: table,tenantId: tenantId });

   if (!existingTable) {
      return res.status(404).json({ success: false, message: "Table not found at this cafe" });
    }

    const cafe = await Client.findById(tenantId);
    const officialCafeName = cafe ? cafe.cafeName : "The Blue Cup";


    res.json({
      success: true,
      table: existingTable.tableNumber,
      cafeName: officialCafeName,
      sessionToken: "optional-jwt-token",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const deletedTable = await Table.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId 
    });
    if (!deletedTable) {
      return res.status(404).json({ message: "Table not found or unauthorized" });
    }
    res.json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
