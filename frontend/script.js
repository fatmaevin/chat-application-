const messageInput = document.getElementById("send-message");
const sendBtn = document.getElementById("send");
const displayMessages = document.getElementById("display-messages");
const username = document.getElementById("user-name");

const backendURL =
  "https://fatmaevin-chat-app-websocket-backend.hosting.codeyourfuture.io/messages";

const state = {
  messages: [],
};
let pollingActive = true;

function renderMessages() {
  displayMessages.innerHTML = "";
  state.messages.forEach((msg) => {
    const p = document.createElement("p");
    p.textContent = `${msg.username}:${msg.text}`;
    displayMessages.appendChild(p);
  });
}

async function startLongPolling() {
  if (!pollingActive) return;
  try {
    let lastMessage;
    if (state.messages.length > 0) {
      lastMessage = state.messages[state.messages.length - 1].timestamp;
    } else {
      lastMessage = null;
    }
    let query = "";
    if (lastMessage) {
      query = `?since=${lastMessage}`;
    }
    const response = await fetch(`${backendURL}${query}`);
    if (!response.ok) {
      throw new Error(`response status:${response.status}`);
    }
    const newMessages = await response.json();
    if (newMessages.length > 0) {
      state.messages.push(...newMessages);
      renderMessages();
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
  if (pollingActive) startLongPolling();
}

async function sendMessage() {
  sendBtn.addEventListener("click", async () => {
    const msg = messageInput.value.trim();
    const user = username.value.trim();
    if (!msg || !user) return;

    try {
      const response = await fetch(backendURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: msg, username: user }),
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      messageInput.value = "";
      username.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
}
window.addEventListener("beforeunload", () => {
  pollingActive = false;
  console.log("Polling stopped");
});
startLongPolling();
sendMessage();
