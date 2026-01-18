import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { CONFIG } from './config/env'; // Our secure typed config
import tripsRouter from './routes/tripsRoutes';

const app = express();
const PORT = 3000; // this port is for out api.

//Middleware
app.use(cors()); // Allows your React app (usually on port 3000 or 5173) to talk to this server
app.use(express.json()); // Allow server to read json.

// Routes
app.use('/api/trips', tripsRouter);


app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})