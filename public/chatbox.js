// chatbox.js
document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const chatboxContainer = document.getElementById('chatbox-container');
  const openChatBtn = document.getElementById('open-chat');
  const closeChatBtn = document.getElementById('close-chat');
  const chatInput = document.getElementById('chat-input');
  
  // Function to open chat
  function openChat() {
    chatboxContainer.style.display = 'flex';
    setTimeout(() => {
      chatboxContainer.classList.add('active');
    }, 10);
    
    // Store chat state in localStorage
    localStorage.setItem('chatboxOpen', 'true');
  }
  
  // Function to close chat
  function closeChat() {
    chatboxContainer.classList.remove('active');
    setTimeout(() => {
      chatboxContainer.style.display = 'none';
    }, 300);
    
    // Store chat state in localStorage
    localStorage.setItem('chatboxOpen', 'false');
  }
  
  // Open chat when button is clicked
  if (openChatBtn) {
    openChatBtn.addEventListener('click', openChat);
  }
  
  // Close chat when X is clicked
  if (closeChatBtn) {
    closeChatBtn.addEventListener('click', closeChat);
  }
  
  // Send message when Enter key is pressed
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Check if chat was previously open
  const chatState = localStorage.getItem('chatboxOpen');
  if (chatState === 'true') {
    openChat();
  }
});

// Function to send message
function sendMessage() {
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  
  if (chatInput && chatInput.value.trim() !== '') {
    // Create user message element
    const userMsg = document.createElement('div');
    userMsg.className = 'user-msg';
    userMsg.textContent = chatInput.value;
    
    // Add message to chat
    chatMessages.appendChild(userMsg);
    
    // Clear input
    const userText = chatInput.value;
    chatInput.value = '';
    
    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate bot response (replace with actual backend call if needed)
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'bot-msg';
      botMsg.textContent = getBotResponse(userText);
      chatMessages.appendChild(botMsg);
      
      // Auto-scroll to bottom again
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
  }
}

// Simple bot response function (replace with your actual logic)
function getBotResponse(userText) {
  userText = userText.toLowerCase();
  
  if (userText.includes('hello') || userText.includes('hi')) {
    return 'Hello there! How can I help you today?';
  } else if (userText.includes('order') || userText.includes('tracking')) {
    return 'To check your order status, please go to the Orders page in your account.';
  } else if (userText.includes('return') || userText.includes('refund')) {
    return 'Our return policy allows returns within 30 days of purchase. Please visit our Returns page for more information.';
  } else if (userText.includes('contact') || userText.includes('support')) {
    return 'You can reach our customer support at support@example.com or call us at +1-234-567-8900.';
  } else {
    return "I'm not sure I understand. Could you please rephrase your question?";
  }
}