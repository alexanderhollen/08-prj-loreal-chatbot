/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Store the conversation history in an array
let conversation = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal. If the user asks anything NOT related to L'Oréal products, beauty routines, recommendations, or beauty-related topics, you MUST reply: 'I can only support you with L'Oréal products, beauty routines, recommendations, and similar topics.' Do not answer other questions.",
  },
];

// Show initial message as a bot bubble
chatWindow.innerHTML = `
  <div class="bubble bot-bubble">
    👋 Hello! How can I help you today?
  </div>
`;

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message from the input box
  const message = userInput.value;

  // Add user's message to conversation history
  conversation.push({ role: "user", content: message });

  // Display user's question above bot response, as a user bubble
  chatWindow.innerHTML += `
    <div class="bubble user-bubble">
      ${message}
    </div>
    <div class="bubble bot-bubble">
      <i>Thinking...</i>
    </div>
  `;

  // Scroll to bottom for new messages
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Send the conversation history to your Cloudflare Worker
  const workerUrl = "https://curly-mouse-1f81.alexlh2003.workers.dev/";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: conversation }),
    });

    const data = await response.json();

    // Get the chatbot's reply from the response
    const botReply = data.choices[0].message.content;

    // Add bot reply to conversation history
    conversation.push({ role: "assistant", content: botReply });

    // Remove the "Thinking..." bubble and add the bot's reply
    // Find the last bot-bubble and replace its content
    const bubbles = chatWindow.querySelectorAll(".bot-bubble");
    bubbles[bubbles.length - 1].innerHTML = botReply;

    // Scroll to bottom for new messages
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    console.error("Error:", error);
    chatWindow.innerHTML += `
      <div class="bubble bot-bubble">
        🤖 Sorry, I couldn't get a response. Please try again later.
      </div>
    `;
  }

  // Clear the input box
  userInput.value = "";
});
