const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const userOrderInputs = require("./utils/userOrders");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "MenuMatch Bot";

const openingMessage = `
 <div>
  <strong>
    <h5>Welcome To MenuMatch</h5>
    <h6>Please select your choice.</h6>
  </strong>
    <ul>
      <li><h6>Select 96 to place an order</h6></li>
      <li><h6>Select 99 to checkout order</h6></li>
      <li><h6>Select 98 to see order history</h6></li>
      <li><h6>Select 97 to see current order</h6></li>
      <li><h6>Select 0 to cancel order</h6></li>
    </ul>
  </div>
`;

const menu = [
  { id: 1, name: "Jollof Rice with Chicken", price: "N3000" },
  { id: 2, name: "Fried Rice with Chicken", price: "N3500" },
  { id: 3, name: "Yam and Scrambled Egg", price: "N2500" },
  { id: 4, name: "Spaghetti with Turkey", price: "N2500" },
  { id: 5, name: "Bread and Beans with Boiled Egg", price: "N2000" },
];

// Run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //  Bot Message
    socket.emit("message", formatMessage(botName, openingMessage));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    //   Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //   Listen for chatMessage
  socket.on("chatMessage", ({ msg, sessionId }) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
    userOrderInputs(msg, sessionId);
    setTimeout(() => {
      socket.emit("message", formatMessage(botName, userOrderInputs(msg)));
    }, 1000);
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      //   Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 5000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
