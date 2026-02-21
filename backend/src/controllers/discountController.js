import Discount from "../models/Discount.js";

export async function createDiscount(req,res){
    try {
        const discount = await Discount.create(req.body); // get data from req body
        res.status(201).json({message: "Discount created successfully."}); // create sus
    } catch (error) {
        res.status(500).json(error); //internal sever error
        console.error(error.message);
    }
}
export async function viewDiscount(req,res){
    try {
        const discount = await Discount.find({}); //{} to get all
        res.status(200).json(discount)  //ok
    } catch (error) {
        res.status(500).json(error);
        console.error(error.message);
    }
}
export async function updateDiscount(req,res) {
    
}
export async function deleteDiscount(req,res) {
    
}