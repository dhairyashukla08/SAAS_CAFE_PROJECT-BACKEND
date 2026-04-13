import MenuItem from "../models/MenuItem.js";
import {redisClient} from "../index.js";

const clearMenuCache = async (tenantId) => {
  if (redisClient.isOpen) {
    const keys = await redisClient.keys(`menu:${tenantId}:*`);
    if (keys.length > 0) await redisClient.del(keys);
  }
};

export const getMenuItems = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: "No Store ID provided" });
    }
    const { category, search, isAdmin, page = 1, limit = 8 } = req.query;
    const cacheKey = `menu:${tenantId}:${category || 'all'}:${search || 'none'}:${page}:${limit}`;
    if (redisClient.isOpen) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) return res.status(200).json(JSON.parse(cachedData));
    }
    let query = { tenantId };
    if (isAdmin !== 'true') {
      query.inStock = true;
    }
    if (category && category !== "All") query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, items] = await Promise.all([
      MenuItem.countDocuments(query),
      MenuItem.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }).lean()
    ]);
    const result = { 
      items, 
      totalPages: Math.ceil(total / limit), 
      currentPage: parseInt(page) 
    };
    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
    }
    res
      .status(200)
      .json({ items, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu" });
  }
};

export const addMenuItem = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const newItem = new MenuItem({ ...req.body, tenantId: tenantId });

    await newItem.save();
    await clearMenuCache(tenantId);
    res.status(201).json(newItem);
  } catch (error) {
    console.error("DETAILED ERROR:", error);
    res.status(400).json({ message: "Error adding item" });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const updatedItem = await MenuItem.findByIdAndUpdate(
      { _id: req.params.id, tenantId: tenantId },
      req.body,
      { new: true },
    );
    if (!updatedItem) return res.status(404).json({ message: "Item not found or unauthorized" });
    await clearMenuCache(tenantId);
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: "Error updating item" });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const deletedItem = await MenuItem.findOneAndDelete({ _id: req.params.id, tenantId });
    if (!deletedItem) return res.status(404).json({ message: "Item not found or unauthorized" });
    await clearMenuCache(tenantId);
    res.json({ message: "Item removed from menu" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
};

export const bulkAddMenuItems = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid data format. Expected an array." });
    }
   const itemsWithTenant = items.map(item => ({
      ...item,
      tenantId
    }));

    const newItems = await MenuItem.insertMany(itemsWithTenant);
    await clearMenuCache(tenantId);
   res.status(201).json({
      message: `${newItems.length} items added successfully`,
      items: newItems,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res
      .status(500)
      .json({
        message: "Error during bulk upload. Check category names/data format.",
      });
  }
};
