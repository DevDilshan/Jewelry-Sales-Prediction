import Discount from "../models/Discount";

function generateCouponCode(name){
    const randomCode = Math.floor(1000+Math.random()*9000);
    return name.toUpperCase().replace(/\s/g,"")+randomCode;
}
export async function createDiscount(req,res) {
    try{
        const{
            discountName,
            disType,
            disPercentage,
            startDate,
            endDate
        }= req.body;

         if (!discountName || !disType || !disPercentage || !startDate || !endDate) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
           if (new Date(endDate) <= new Date(startDate)) { //extra
            return res.status(400).json({message: "End date must be after start date"});
        }
        let couponCode =null;
             if(disType==="coupon"){
                couponCode = generateCouponCode(discountName);
             }

        const discount = await Discount.create({
            discountName,
            disType,
            disPercentage,
            couponCode,
            startDate,
            endDate
        });
        res.status(201).json(discount);
    }

    catch(error){
        res.status(500).json({
            message:"Internal server error",error:error.message });
    }
 
}
export async function getAllDiscounts(req, res) {
    try {

        const discounts = await Discount.find();
        res.status(200).json(discounts);

    } 
    catch (error) {
        res.status(500).json({
             message: "Internal server error",error: error.message});
    }
}
export async function updateDiscount(req, res) {
    try {

        const updated = await Discount.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Discount not found" });
        }

        res.status(200).json(updated);

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }

}
export async function deleteDiscount(req, res) {
    try {

        const deleted = await Discount.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Discount not found" });
        }

        res.status(200).json({ message: "Discount deleted successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",error: error.message
        });
    }
}

