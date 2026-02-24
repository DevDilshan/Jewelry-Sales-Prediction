import express from "express"
import dotenv from "dotenv";
import cors from 'cors';
import {connectDB} from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import staffRoutes from './routes/staffRoutes.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

connectDB();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes)
app.use('/api/staff', staffRoutes)

app.listen(PORT, ()=>{
    console.log("Server started on PORT:",PORT);
})

