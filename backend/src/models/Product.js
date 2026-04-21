import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({

  productName :{
    type:String,
    required:true,
    trim:true

  },

  productDescription :{
    type:String
  },

  productCategory:{
    type:String,
    required:true
  },

  productPrice :{
    type:Number,
    required:true

  },

  metalMaterial: {
  type: String,
  enum: ['gold', 'silver', 'platinum', 'white gold', 'rose gold'],
  },

 gemType: {
  type: String,
  enum: ['diamond', 'pearl', 'ruby', 'emerald', 'sapphire', 'none'],
  default: 'none'
},

  stockQuantity:{
    type:Number,
    required:true,
    default:0
  },
  

  productImage:{
    type:String
  },

  /** Extra photos (same format as productImage — URLs or data URLs). Shown in shop gallery. */
  additionalImages: {
    type: [String],
    default: [],
  },

  reorderLevel :{
    type:Number,
    default:5
  },
  
  isActive:{
    type:Boolean,
    required:true
  }


}, {timestamps: true});

export default mongoose.model("Product", productSchema);