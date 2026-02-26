import mongoose, { Schema } from "mongoose";

const discountShema = new Schema({
     discountName:{
        type:String,
        required:true
     },
     disPercentage:{
        type:Number,
        required:true,
        min:[0,"Discount cannot be negative"],
        max:[75,"Discount cannot exceed 75%"]
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
},{timeStanps:true})

const Discount= mongoose.model(Discount,"discountShema");
export default Discount;