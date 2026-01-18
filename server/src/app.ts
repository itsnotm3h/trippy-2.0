import express, { type Request, type Response } from 'express';
import cors from 'cors';
import 'dotenv/config';


const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors()); // Allows your React app (usually on port 3000 or 5173) to talk to this server
app.use(express.json()); // Allow server to read json.

app.get('/api/status', (req:Request, res:Response)=>{
    res.json({message:"Backend is connected to React!"});
})

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})