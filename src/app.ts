import express from "express";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { specs } from "./swaggerConfig";
require("dotenv").config();

declare global {
  namespace Express {
    export interface Request {
      user?: { id: number; name: string; email: string };
    }
  }
}

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
