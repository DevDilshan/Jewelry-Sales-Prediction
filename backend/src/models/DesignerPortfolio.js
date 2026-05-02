import mongoose, { Schema } from "mongoose";

const portfolioImageSchema = new Schema(
  {
    /** Path relative to uploads root, e.g. designer-portfolio/dp-....png */
    relPath: { type: String, required: true, trim: true },
    caption: { type: String, trim: true, maxlength: 500, default: "" },
    originalName: { type: String, trim: true, default: "" },
    mimeType: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

/**
 * Public-facing portfolio for a jewelry designer (staff). Shown on the storefront when published.
 */
const designerPortfolioSchema = new Schema(
  {
    staff: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      unique: true,
      index: true,
    },
    /** Public name (can differ from account username) */
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 8000,
      default: "",
    },
    specialties: {
      type: [String],
      default: [],
      validate: {
        validator(arr) {
          if (!Array.isArray(arr) || arr.length > 20) return false;
          return arr.every((s) => String(s).trim().length <= 80);
        },
        message: "At most 20 specialties, each up to 80 characters.",
      },
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
      max: 80,
    },
    completedProjects: {
      type: Number,
      default: 0,
      min: 0,
      max: 100000,
    },
    images: {
      type: [portfolioImageSchema],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

designerPortfolioSchema.index({ updatedAt: -1 });

const DesignerPortfolio = mongoose.model("DesignerPortfolio", designerPortfolioSchema);
export default DesignerPortfolio;
