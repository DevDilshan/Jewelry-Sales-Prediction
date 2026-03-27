import Feedback from "../models/Feedback.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";

function customerDisplayName(customer) {
  if (!customer) return "";
  const n = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  return n || customer.email || "";
}

/** Customer: submit feedback only for their own Delivered order, once per order */
export async function createCustomerFeedback(req, res) {
  try {
    const { orderId, title, feedback, rating } = req.body;
    if (!orderId || !feedback || rating == null) {
      return res.status(400).json({ message: "Order, review text, and rating are required." });
    }
    const r = Number(rating);
    if (r < 1 || r > 5 || !Number.isInteger(r)) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (String(order.customer) !== String(req.customerId)) {
      return res.status(403).json({ message: "This order does not belong to your account." });
    }
    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        message: "You can leave feedback only after your order is marked as delivered.",
      });
    }

    const existing = await Feedback.findOne({ order: order._id, customer: req.customerId }); //unique review fixed
    if (existing) {
      return res.status(400).json({ message: "You have already submitted feedback for this order." });
    }

    const customer = await Customer.findById(req.customerId);
    const doc = await Feedback.create({
      customer: req.customerId,
      order: order._id,
      customerName: customerDisplayName(customer),
      title: (title || "").trim(),
      feedback: String(feedback).trim(),
      rating: r,
    });

    const populated = await Feedback.findById(doc._id).populate({
      path: "order",
      select: "orderStatus totalAmount createdAt",
      populate: { path: "items.product", select: "productName productCategory productImage" },
    });

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Feedback for this order already exists." });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** Customer: list own feedback */
export async function getMyCustomerFeedback(req, res) {
  try {
    const list = await Feedback.find({ customer: req.customerId })
      .populate({
        path: "order",
        select: "orderStatus totalAmount createdAt",
        populate: { path: "items.product", select: "productName productCategory productImage" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** Staff: all feedback with customer + order (optional ?limit=n for dashboards) */
export async function listFeedbackForStaff(req, res) {
  try {
    let q = Feedback.find({})
      .populate("customer", "firstName lastName email")
      .populate({
        path: "order",
        select: "orderStatus totalAmount createdAt",
        populate: { path: "items.product", select: "productName productCategory" },
      })
      .sort({ createdAt: -1 });

    if (req.query.limit !== undefined) {
      const n = parseInt(req.query.limit, 10);
      if (!Number.isNaN(n) && n > 0) {
        q = q.limit(Math.min(n, 150));
      }
    }

    const list = await q;
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** Staff: reply to a feedback */
export async function replyToFeedback(req, res) {
  try {
    const { staffReply } = req.body;
    const text = (staffReply || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Reply text is required." });
    }

    const fb = await Feedback.findById(req.params.id);
    if (!fb) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    fb.staffReply = text;
    fb.staffReplyAt = new Date();
    fb.staffRepliedByName = req.user?.name || "Staff";
    await fb.save();

    const populated = await Feedback.findById(fb._id)
      .populate("customer", "firstName lastName email")
      .populate({
        path: "order",
        populate: { path: "items.product", select: "productName" },
      });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function getFeedbackStats(req, res) {
  try {
    const total = await Feedback.countDocuments();
    const pendingReply = await Feedback.countDocuments({
      $or: [{ staffReply: { $exists: false } }, { staffReply: "" }, { staffReply: null }],
    });
    res.status(200).json({ total, pendingReply });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function deleteFeedback(req, res) {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: "feedback not found" });
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** Customer: update their own feedback */
export async function updateCustomerFeedback(req, res) {
  try {
    const { title, feedback, rating } = req.body;
    
    const existing = await Feedback.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Feedback not found." });
    
    if (String(existing.customer) !== String(req.customerId)) {
      return res.status(403).json({ message: "This feedback does not belong to you." });
    }

    if (title !== undefined) existing.title = String(title).trim();
    if (feedback !== undefined) existing.feedback = String(feedback).trim();
    if (rating !== undefined) {
      const r = Number(rating);
      if (r < 1 || r > 5 || !Number.isInteger(r)) {
        return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
      }
      existing.rating = r;
    }
    
    await existing.save();

    const populated = await Feedback.findById(existing._id).populate({
      path: "order",
      select: "orderStatus totalAmount createdAt",
      populate: { path: "items.product", select: "productName productCategory productImage" },
    });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

/** Customer: delete their own feedback */
export async function deleteCustomerFeedback(req, res) {
  try {
    const existing = await Feedback.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Feedback not found." });
    
    if (String(existing.customer) !== String(req.customerId)) {
      return res.status(403).json({ message: "This feedback does not belong to you." });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Feedback deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
