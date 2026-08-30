import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import tripRouter from "./routes/tripRouter";
import userRouter from "./routes/userRouter";
import { COOKIE_SECRET_KEY } from "./config/env";
import expensesRouter from "./routes/expensesRouter";
import { express as useragent } from "express-useragent";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = 3000; // this port is for out api.

//Middleware
app.use(
  cors({
    origin: process.env.LOCALHOST_ORIGIN,
    credentials: true,
  }),
); // Allows your React app (usually on port 3000 or 5173) to talk to this server
app.use(express.json()); // Allow server to read json.
app.use(useragent());
app.use(cookieParser(COOKIE_SECRET_KEY));

app.use("/api/authenticate", userRouter);

// Routes
app.use("/api/trips", tripRouter);
app.use("/api/expense", expensesRouter);
app.use(errorHandler);

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   // If it's an AppError, use its status code; otherwise, default to 500
//   const statusCode = err.statusCode || 500;
//   const status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

//   console.error(`ERROR 💥: ${err.message}`);

//   res.status(statusCode).json({
//     status: status,
//     message: err.message || "An unexpected error occurred",
//     // Only show stack trace in development mode
//     stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
