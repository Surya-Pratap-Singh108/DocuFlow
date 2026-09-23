import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import uploadRouter from "./routes/uploads.route.js";
import queryRouter from "./routes/query.route.js";
import conversationRouter from "./routes/conversation.routes.js";
import getRouter from "./routes/documents.routes.js";
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'DocuFlow Server is healthy' });
});

app.use("/api/auth", authRouter);
app.use("/api/documents", uploadRouter);
app.use("/api/documents", getRouter);
app.use("/api/documents", queryRouter);
app.use("/api/documents", conversationRouter);
export default app;