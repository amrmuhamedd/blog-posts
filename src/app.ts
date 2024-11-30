require('dotenv').config();
import express from "express";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import tagRoutes from './routes/tagRoutes';
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { specs } from "./swaggerConfig";

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(specs) as any);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use('/api/tags', tagRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
