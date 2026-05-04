import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import Settings from "../models/Settings.js";
import { calculateDistance } from "../utils/distance.js";

export const placeOrder = async (req, res) => {
  try {
    const { tenantId,tableNumber, items, totalAmount,couponUsed ,userLat,userLon} = req.body;
    const config = await Settings.findOne({ tenantId });
    if(config){
      if(!config.paymentEnabled){
        return res.status(403).json({ message: "Ordering is currently paused by the cafe." });
      }
      if (config.requireLocation) {
        if (!userLat || !userLon) {
          return res.status(400).json({ message: "Location access is required to place an order." });
        }
        const distance = calculateDistance(
          parseFloat(userLat), 
          parseFloat(userLon), 
          config.cafeLatitude, 
          config.cafeLongitude
        );
        if (distance > config.orderRadius) {
          return res.status(403).json({ 
            message: `Order denied. You are ${distance.toFixed(2)}km away. Please order from within the cafe (${config.orderRadius}km radius).` 
          });
        }
      }
    }
    const newOrder = new Order({
      tenantId,
      tableNumber,
      items,
      totalAmount,
      couponUsed
    });
    const tasks = [newOrder.save()];
   if (couponUsed) {
      tasks.push(Coupon.findOneAndUpdate(
        { code: couponUsed, tenantId: tenantId },
        { $inc: { usedCount: 1 } }
      ));
    }
    const [savedOrder] = await Promise.all(tasks);
    if (req.io) {
      req.io.to(`admin_${tenantId}`).emit("new_order", savedOrder);
    }
   return  res
      .status(201)
      .json({ message: "Order placed successfully", order: savedOrder });
  } catch (error) {
   return res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
};

export const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      tenantId: req.user.tenantId,
      status: { $in: ["Pending", "Preparing"] },
    }).sort({ createdAt: -1 }).lean();;
   return  res.status(200).json(orders);
  } catch (error) {
   return res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { tenantId } = req.user;

    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: id, tenantId: tenantId },
      { status },
      { new: true },
    ).lean();
  if (!updatedOrder) return res.status(404).json({ message: "Order not found or unauthorized" });
    if (req.io) {
      req.io.to(id).emit("order_status_updated", {
        orderId: id,
        status: updatedOrder.status
      });
      req.io.to(`admin_${tenantId}`).emit("admin_order_updated", updatedOrder);
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const history = await Order.find({
      tenantId: tenantId,
      status: { $in: ["Served", "Completed"] },
      createdAt: { $gte: yesterday }
    }).sort({ createdAt: -1 }).limit(50).lean();
    
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const { tenantId, tableNumber } = req.query;
    if (!tenantId || !tableNumber) {
      return res.status(400).json({ message: "tenantId and tableNumber required" });
    }
    const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const orders = await Order.find({
      tenantId,
      tableNumber,
      createdAt: { $gte: since },
    }).sort({ createdAt: -1 }).lean();

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};