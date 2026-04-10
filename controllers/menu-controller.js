import MenuItem from "../models/MenuItem.js";
import {redisClient} from "../index.js";

const clearMenuCache = async () => {
  if (redisClient.isOpen) {
    const keys = await redisClient.keys('menu:*');
    if (keys.length > 0) await redisClient.del(keys);
  }
};

export const getMenuItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const { category, search ,isAdmin } = req.query;
    const cacheKey = `menu:${category || 'all'}:${search || 'none'}:${page}:${limit}:${isAdmin || 'false'}`;
    if (redisClient.isOpen) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) return res.status(200).json(JSON.parse(cachedData));
    }
    let query = {};
    if (isAdmin !== 'true') {
      query.inStock = true;
    }
    if (category && category !== "All") query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      MenuItem.countDocuments(query),
      MenuItem.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean()
    ]);
    const result = { items, totalPages: Math.ceil(total / limit), currentPage: page };
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
    const { name, description, image, category, variants } = req.body;
    if (!variants || variants.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one price variant is required" });
    }
    const newItem = new MenuItem({
      name,
      description,
      image,
      category,
      variants,
    });

    await newItem.save();
    await clearMenuCache();
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error adding item" });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    await clearMenuCache();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: "Error updating item" });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    await clearMenuCache();
    res.json({ message: "Item removed from menu" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
};

export const bulkAddMenuItems = async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid data format. Expected an array." });
    }
    const isValid = items.every(
      (item) => item.name && item.category && item.variants,
    );
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Some items are missing required fields" });
    }

    const newItems = await MenuItem.insertMany(items);
    await clearMenuCache();
    res
      .status(201)
      .json({
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
