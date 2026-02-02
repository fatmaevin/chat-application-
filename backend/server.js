const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const messages = [];
const waitingResponse = [];

app.get("/messages", (req, res) => {
  const since = Number(req.query.since);
  let lastMessages;

  if (!since) {
    lastMessages = messages;
  } else {
    lastMessages = messages.filter((msg) => msg.timestamp > since);
  }

  if (lastMessages.length > 0) {
    res.json(lastMessages);
  } else {
    waitingResponse.push((newMessages) => {
      res.json(newMessages);
    });
  }
});

app.post("/messages", (req, res) => {
  const {text,username} = req.body;
  if (!text || !username) {
    return res.status(400).json({ error: "Text and username are required" });
  }
  const newMessage = {
    text,
    username,
    timestamp: Date.now(),
  };
  messages.push(newMessage);
  while (waitingResponse.length > 0) {
    const callback = waitingResponse.pop();
    callback([newMessage]); 
  }

  res.status(201).json(newMessage);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
