const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const messages = [];

app.get("/messages", (req, res) => {
  res.json(messages);
});

app.post("/messages", (req, res) => {
  const text = req.body.text;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  const newMessage = {
    text,
    timestamp: Date.now(),
  };
  messages.push(newMessage);

  res.status(201).json(newMessage);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
