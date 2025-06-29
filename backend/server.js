import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import UserRouter from "./routes/userRoute.js";
import GroupRouter from "./routes/groupRoute.js";
import socketIO from "./socket.js";
import messageRouter from "./routes/messageRouter.js";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//middlewares
app.use(cors());
app.use(express.json());

//connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });

//socket io
socketIO(io);

//routes
app.use("/api/users", UserRouter);
app.use("/api/groups", GroupRouter);
app.use("/api/messages", messageRouter);

//start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


