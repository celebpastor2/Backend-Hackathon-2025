
function sendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (message === "") return;

  const chat = document.getElementById("chat-messages");

  const userMsg = document.createElement("div");
  userMsg.classList.add("user-msg");
  userMsg.innerText = message;
  chat.appendChild(userMsg);

  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.classList.add("bot-msg");
    botMsg.innerText = "Thanks for reaching out. We'll get back to you shortly.";
    chat.appendChild(botMsg);
    chat.scrollTop = chat.scrollHeight;
  }, 1000);
}


let chat_doc = document.getElementById("close-chat");
let chat_container = document.getElementById("chatbox-container");
let open_chat = document.getElementById("open-chat");

chat_doc.addEventListener("click", function(e){
	open_chat.style.display = "block";
	chat_container.style.display = "none";
});

open_chat.addEventListener("click", function(e){
  chat_container.style.display = "block";
	open_chat.style.display = "none";
});


