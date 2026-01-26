const messageInput = document.getElementById("send-message");
const sendBtn = document.getElementById("send");
const displayMessages = document.getElementById("display-messages");

const backendURL = "http://localhost:3000/messages";

async function getMessages() {
  try {
    const response = await fetch(backendURL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const messages = await response.json();
    displayMessages.innerHTML = "";
    messages.forEach((msg) => {
      const p = document.createElement("p");
      p.textContent = msg.text;
      displayMessages.appendChild(p);
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

async function sendMessage() {
  sendBtn.addEventListener("click", async () => {
    const msg = messageInput.value.trim();
    if (!msg) return;

    try {
      const response = await fetch(backendURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: msg }),
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      messageInput.value = "";
      getMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
}
getMessages();
sendMessage();
