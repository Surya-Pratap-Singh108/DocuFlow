import express from "express";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'DocuFlow Server is healthy' });
});

export default app;