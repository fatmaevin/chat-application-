const messageInput = document.getElementById("send-message");
const sendBtn = document.getElementById("send");
const displayMessages = document.getElementById("display-messages");
const username = document.getElementById("user-name");

const backendURL =
  "https://fatmaevin-chat-app-websocket-backend.hosting.codeyourfuture.io/messages";
const ws = new WebSocket(
  "wss://fatmaevin-chat-app-websocket-backend.hosting.codeyourfuture.io"
);

ws.onopen = () => {
  console.log("WebSocket connection opened");
  ws.send(JSON.stringify({ action: "get-old-messages" }));
};

function renderMessage(msg) {
  const p = document.createElement("p");
  p.id = msg.id;
  p.innerHTML = `
    <span>${msg.username}: ${msg.text}</span>
    <button class="like-btn">👍 <span class="likes">${msg.likes}</span></button>
    <button class="dislike-btn">👎 <span class="dislikes">${msg.dislikes}</span></button>
  `;
  displayMessages.appendChild(p);

  p.querySelector(".like-btn").addEventListener("click", () => {
    ws.send(JSON.stringify({ action: "react", id: msg.id, type: "like" }));
  });
  p.querySelector(".dislike-btn").addEventListener("click", () => {
    ws.send(JSON.stringify({ action: "react", id: msg.id, type: "dislike" }));
  });
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.action === "old-messages") {
    data.messages.forEach(renderMessage);
  } else if (data.action === "update-react") {
    const msgEl = document.getElementById(data.id);
    if (msgEl) {
      msgEl.querySelector(".likes").textContent = data.likes;
      msgEl.querySelector(".dislikes").textContent = data.dislikes;
    }
  } else if (data.action === "new-message") {
    renderMessage(data);
  }
};

sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  const user = username.value.trim();
  if (!text || !user) return;

  ws.send(
    JSON.stringify({
      action: "new-message",
      text,
      username: user,
    })
  );

  messageInput.value = "";
});

window.addEventListener("beforeunload", () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
    console.log("WebSocket closed");
  }
});
