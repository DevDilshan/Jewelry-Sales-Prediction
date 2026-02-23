//Es6 
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

  productBrand :{
    type:String,
    required:true
  },

  stockQuantity:{
    type:Number,
    required:true,
    default:0
  },
  
  rating:{
    type:Number,
    min:0,
    max:5,
    default:0
  },

  productImage:{
    type:String
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