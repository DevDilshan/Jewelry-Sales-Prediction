import mongoose, { Schema } from 'mongoose';

const customerSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    loyaltyPoints: { type: Number, default: 0 }, 
    membershipTier: { 
        type: String, 
        enum: ['Bronze', 'Silver', 'Gold'], 
        default: 'Bronze' 
    },
}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);
