const express = require("express");
const cors = require("cors");
const http = require("http");
const { server: WebSocketServer } = require("websocket");
const crypto = require("crypto");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// HTTP + WS server
const server = http.createServer(app);
const wsServer = new WebSocketServer({ httpServer: server });

const clients = [];
const messages = [];
const waitingResponse = [];

app.get("/", (req, res) => {
  res.send("server is running");
});

// ---------- WebSocket ----------
wsServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  clients.push(connection);
  console.log("Client connected");

  connection.on("message", (message) => {
    const data = JSON.parse(message.utf8Data);
    if (data.action === "get-old-messages") {
      connection.sendUTF(
        JSON.stringify({
          action: "old-messages",
          messages: messages,
        })
      );
    }

    //  NEW MESSAGE
    if (data.action === "new-message") {
      if (!data.text || !data.username) return;

      const newMessage = {
        id: crypto.randomUUID(),
        text: data.text,
        username: data.username,
        timestamp: Date.now(),
        likes: 0,
        dislikes: 0,
      };

      messages.push(newMessage);

      // all clients
      clients.forEach((c) => {
        c.sendUTF(
          JSON.stringify({
            action: "new-message",
            ...newMessage,
          })
        );
      });
    }

    // 🔹 REACTION
    if (data.action === "react") {
      const msg = messages.find((m) => m.id === data.id);
      if (!msg) return;

      if (data.type === "like") msg.likes += 1;
      if (data.type === "dislike") msg.dislikes += 1;

      clients.forEach((c) => {
        c.sendUTF(
          JSON.stringify({
            action: "update-react",
            id: msg.id,
            likes: msg.likes,
            dislikes: msg.dislikes,
          })
        );
      });
    }
  });

  connection.on("close", () => {
    const index = clients.indexOf(connection);
    clients.splice(index, 1);
    console.log("Client disconnected");
  });
});

// ---------- Long Polling ----------
app.get("/messages", (req, res) => {
  const since = Number(req.query.since);
  const lastMessages = since
    ? messages.filter((msg) => msg.timestamp > since)
    : messages;

  if (lastMessages.length > 0) {
    res.json(lastMessages);
  } else {
    waitingResponse.push((newMessages) => res.json(newMessages));
  }
});

// ---------- Send Message ----------
app.post("/messages", (req, res) => {
  const { text, username } = req.body;
  if (!text || !username) {
    return res.status(400).json({ error: "Text and username required" });
  }

  const newMessage = {
    id: crypto.randomUUID(), //create unique id
    text,
    username,
    timestamp: Date.now(),
    likes: 0,
    dislikes: 0,
  };

  messages.push(newMessage);

  // Long polling notify
  while (waitingResponse.length > 0) {
    const cb = waitingResponse.pop();
    cb([newMessage]);
  }

  // WebSocket broadcast
  clients.forEach((client) => {
    client.sendUTF(
      JSON.stringify({
        action: "new-message",
        ...newMessage,
      })
    );
  });

  res.status(201).json(newMessage);
});

// ---------- Start server ----------
server.listen(port, () => {
  console.log(`HTTP + WS server running on port ${port}`);
});
