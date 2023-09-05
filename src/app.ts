import express from "express";
import userRoutes from "./routes/userRoutes";
require("dotenv").config();

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
