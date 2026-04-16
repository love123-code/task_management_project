const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


app.use(express.json());


app.use(
  cors({
    origin: "https://todo-frontend-three-black.vercel.app",
    credentials: true,
  })
);


app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


app.get("/api/user", (req, res) => {
  res.json({
    message: "User API working ✅",
  });
});

// ✅ PORT (Render ke liye important)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
