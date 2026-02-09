const messageInput = document.getElementById("send-message");
const sendBtn = document.getElementById("send");
const displayMessages = document.getElementById("display-messages");
const username = document.getElementById("user-name");

const backendURL = "http://localhost:3000/messages";
const ws = new WebSocket("ws://localhost:3000");

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

  if (data.action === "update-react") {
    const msgEl = document.getElementById(data.id);
    if (msgEl) {
      msgEl.querySelector(".likes").textContent = data.likes;
      msgEl.querySelector(".dislikes").textContent = data.dislikes;
    }
  } else if (data.action === "new-message") {
    renderMessage(data);
  }
};

sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  const user = username.value.trim();
  if (!text || !user) return;

  await fetch(backendURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, username: user }),
  });

  messageInput.value = "";
  username.value = "";
});
