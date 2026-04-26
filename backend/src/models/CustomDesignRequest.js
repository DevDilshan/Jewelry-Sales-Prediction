import mongoose, { Schema } from "mongoose";

/**
 * Customer-submitted request for a bespoke / custom jewelry piece, with an optional sketch image.
 */
const customDesignRequestSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 8000,
    },
    /** Path relative to the uploads root, e.g. custom-designs/abc.png */
    sketchRelPath: {
      type: String,
      required: true,
      trim: true,
    },
    sketchOriginalName: {
      type: String,
      trim: true,
      default: "",
    },
    sketchMimeType: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "quoted", "declined", "completed"],
      default: "pending",
      index: true,
    },
    /** Internal note visible to staff only */
    staffNote: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: "",
    },
  },
  { timestamps: true }
);

customDesignRequestSchema.index({ createdAt: -1 });

const CustomDesignRequest = mongoose.model("CustomDesignRequest", customDesignRequestSchema);
export default CustomDesignRequest;
