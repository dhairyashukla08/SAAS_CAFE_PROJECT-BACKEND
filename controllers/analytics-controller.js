import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import { redisClient } from "../index.js";
import mongoose from "mongoose";

export const getBusinessSummary = async (req, res) => {
  try {
    const { tenantId } = req.user;
  const cacheKey = `admin:summary:${tenantId}`;


    if (redisClient && redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return res.status(200).json(JSON.parse(cached));
    }

    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOf7Days = new Date(new Date().setDate(now.getDate() - 7));
    const startOf30Days = new Date(new Date().setDate(now.getDate() - 30));
    const [revenueStats, bestSellers, couponData, totalLifetimeOrders] = await Promise.all([
      Order.aggregate([
        { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
        {
          $facet: {
            today: [
              { $match: { createdAt: { $gte: startOfToday } } },
              { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
            ],
            week: [
              { $match: { createdAt: { $gte: startOf7Days } } },
              { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ],
            month: [
              { $match: { createdAt: { $gte: startOf30Days } } },
              { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]
          }
        }
      ]),
      Order.aggregate([
        { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
        { $match: { createdAt: { $gte: startOf30Days } } }, 
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            totalQty: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }
        },
        { $sort: { totalQty: -1 } },
        { $limit: 5 }
      ]),
 
      Promise.all([
        Coupon.find({ tenantId }, 'code usedCount usageLimit discountValue').lean(),
        Coupon.countDocuments({ tenantId })
      ]),
      Order.countDocuments({ tenantId }) ,
      
    ]);

    const result = {
      summary: {
        today: revenueStats[0].today[0]?.total || 0,
        todayCount: revenueStats[0].today[0]?.count || 0,
        week: revenueStats[0].week[0]?.total || 0,
        month: revenueStats[0].month[0]?.total || 0,
        lifetimeOrders: totalLifetimeOrders, 
        totalCoupons: couponData[1] 
      },
      bestSellers,
      coupons: couponData[0]
    };

    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(result));
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Analytics failed", error: error.message });
  }
};