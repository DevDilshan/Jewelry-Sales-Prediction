import mongoose, { Schema } from "mongoose";

const discountShema = new Schema({
     discountName:{
        type:String,
        required:true
     },
     disType:{
      type:String,
      enum:["automatic","coupon"],
      required:true
     },
     disPercentage:{
        type:Number,
        required:true,
        min:[0,"Discount cannot be negative"],
        max:[75,"Discount cannot exceed 75%"]
     },
     couponCode:{ //only used if discount type is "coupon"
      type:String,
      unique:true,
      sparse:true //allows null values 
     },
     startDate:{
        type:Date,
        required:true
     },
     endDate:{
        type:Date,
        required:true,
        validate:{
            validator:function(value){
                return value>this.startDate;
            },
            message:"End date must be after start date"
        }
     },
     isActive:{
         type:Boolean,
         default:true
     }
},{timestanps:true})

const Discount= mongoose.model("Discount",discountShema);
export default Discount;