const express = require("express");
const colors = require("colors");
const dbConnect = require("./db.js");
require("dotenv").config();
const { errorHandler, routeNotFound } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const path = require("path");
const axios = require("axios");
const Message = require("./models/message.js");
const cors = require("cors");

dbConnect();
const app = express();
app.use(express.json());
app.use(cors());

// Main routes
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);
 
// -----------------------------------------------------------------------------

const __dirname$ = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname$, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname$, "client", "build", "index.html"));
  });
} else {
  // First route
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Hello from Chat-app server",
    });
  });
}

// -----------------------------------------------------------------------------

// Error handling routes
app.use(routeNotFound);
app.use(errorHandler);

const server = app.listen(process.env.SERVER_PORT, () => {
  console.log(
    colors.green(`\nServer is UP on PORT ${process.env.SERVER_PORT}`)
  ); 
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Sockets are in action");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData.name, "connected");
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });
  socket.on("new message", async (newMessage) => {
    var chat = newMessage.chatId;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });
  
  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room);
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
  });
  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    socket.leave(socket.id);
  });
});
