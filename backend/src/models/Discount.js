import mongoose, { Schema } from "mongoose";

const discountSchema = new Schema ({
    discountName: {
        type : String,

    },
    discountAmount: {type:Number},
    discountCoupen:{
        type:String,
        unique:true,
    },
    startDate:{
        type:Date

    },
    endDate:{type:Date},

})

const Discount = mongoose.model("Discount", discountSchema);
export default Discount;