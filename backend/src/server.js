import express from "express"
import dotenv from "dotenv";
import cors from 'cors';
import {connectDB} from './config/db.js'
import staffRoutes from './routes/staffRoutes.js'
import productRoutes from './routes/productRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import discountRoutes from './routes/discountRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import orderRoutes from './routes/orderRoutes.js';
import productReviewRoutes from './routes/productReviewRoutes.js';
import { verifyToken } from "./middlewares/staffAuthMiddleware.js";
import { allowRoles } from "./middlewares/staffRoleMiddleware.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

connectDB();
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/staff', staffRoutes)
app.use('/api/product', productRoutes)
app.use('/api/discount', discountRoutes)
app.use('/api/feedback',  feedbackRoutes)
app.use('/api/customer', customerRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/product-review', productReviewRoutes)

app.listen(PORT, ()=>{
    console.log("Server started on PORT:",PORT);
})

