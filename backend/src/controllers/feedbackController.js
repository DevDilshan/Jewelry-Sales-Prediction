import Feedback from '../models/Feedback.js';
import mongoose from 'mongoose';

export const createFeedback = async (req, res) => {
  try {
    const { product, inquiryType, rating, comment } = req.body;

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 3 images allowed'
        });
      }

      const maxSize = 5 * 1024 * 1024;
      for (const file of req.files) {
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: `Image "${file.originalname}" exceeds the 5MB size limit`
          });
        }
      }

      const allowedTypes = ['image/jpeg', 'image/png'];
      for (const file of req.files) {
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `Image "${file.originalname}" is not valid. Only jpeg, png allowed`
          });
        }
      }
    }

    if (inquiryType === 'review') {
      const parsedRating = Number(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a whole number between 1 and 5'
        });
      }
    }

    const images = req.files ? req.files.map(f => f.path) : [];

    const feedback = await Feedback.create({
      product,
      customer: req.user._id,
      inquiryType,
      rating: inquiryType === 'review' ? Number(rating) : undefined,
      comment,
      images
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted and published successfully',
      data: feedback
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getProductFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const feedbacks = await Feedback.find({
      product: req.params.productId
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('customer', 'firstName lastName');

    const stats = await Feedback.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(req.params.productId),
          inquiryType: 'review'
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: feedbacks,
      stats: stats[0] || { avgRating: 0, totalReviews: 0 },
      pagination: { currentPage: Number(page), limit: Number(limit) }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ customer: req.user._id })
      .populate('product', 'productName productImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: feedbacks });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const { product, inquiryType, startDate, endDate } = req.query;

    const filter = {};
    if (product)     filter.product = product;
    if (inquiryType) filter.inquiryType = inquiryType;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const feedbacks = await Feedback.find(filter)
      .populate('customer', 'firstName lastName email')
      .populate('product', 'productName')
      .populate('adminResponse.respondedBy', 'username role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedbacks.length, data: feedbacks });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ success: false, message: 'Feedback not found' });

    const isOwner = feedback.customer.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'productmanager', 'sales'].includes(req.user.role);

    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (isOwner && !isAdmin) {
      if (req.body.rating  !== undefined) feedback.rating  = req.body.rating;
      if (req.body.comment !== undefined) feedback.comment = req.body.comment;
    }

    if (isAdmin) {
      if (req.body.comment !== undefined) feedback.comment = req.body.comment;
      if (req.body.adminResponse) {
        feedback.adminResponse = {
          message:     req.body.adminResponse,
          respondedBy: req.user._id,
          respondedAt: new Date()
        };
      }
    }

    await feedback.save();
    res.json({ success: true, message: 'Feedback updated', data: feedback });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ success: false, message: 'Feedback not found' });

    const isOwner = feedback.customer.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'productmanager', 'sales'].includes(req.user.role);

    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    await feedback.deleteOne();
    res.json({ success: true, message: 'Feedback deleted successfully' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFeedbackAnalytics = async (req, res) => {
  try {
    const [avgPerProduct, feedbackTrend, inquiryBreakdown] = await Promise.all([

      Feedback.aggregate([
        { $match: { inquiryType: 'review' } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $project: { 'product.productName': 1, avgRating: { $round: ['$avgRating', 1] }, count: 1 } },
        { $sort: { avgRating: -1 } }
      ]),

      Feedback.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      Feedback.aggregate([
        { $group: { _id: '$inquiryType', count: { $sum: 1 } } }
      ])

    ]);

    res.json({
      success: true,
      data: { avgPerProduct, feedbackTrend, inquiryBreakdown }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
