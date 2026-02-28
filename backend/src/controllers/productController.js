import Product from "../models/Product.js";

//GET all products
export const getAllProducts = async (req, res) =>{
  try{
    const products = await Product.find({ isActive: true})
    res.status(200).json(products)
  }catch (error){
    res.status(500).json({message : error.message})
  }
};

//Get single Product
export const getProductById = async (req,res)=>{
  try{
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({message: 'Product not found'})
      res.status(200).json(product)
  } catch (error){
      res.status(500).json({message: error.message})

  }
  };


//POST create product
export const createProduct = async(req,res) =>{
  try{
    const product = new Product(req.body)
    const savedProduct = await product.save()
    res.status(201).json(savedProduct)
  }catch (error){
      res.status(500).json({message: error.message})
  }
  };

  //PUT update Product
  export const updateProduct = async(req,res) =>{
    try{
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new:true}
      )
      if (!updated) return res.status(404).json({message:'Product not found'})
        res.status(200).json(updated)
    }catch (error){
      res.status(500).json({messge: error.messege})
    }
    };

    //DELETE product (soft delete)
    export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndUpdate(
      req.params.id,        
      { isActive: false },  
      { new: true }         
    )
    if (!deleted) return res.status(404).json({ message: 'Product not found' })
    res.status(200).json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
  
