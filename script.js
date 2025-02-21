import { getModel } from "./mainmodule.js";

const chatInput = document.querySelector('#chat-input');
const sendMessage = document.querySelector('#chat-send');
const chatContainer = document.querySelector('.chat-cont');
const personaSelect = document.querySelector('#persona');

const personaNames = {
    oiia: "OIIAI Cat",
    rick: "Rick Astley",
    scary: "Evil Larry",
    finn: "Finn"
};

// Initialize markdown-it with plugins for strikethrough and underline
const md = window.markdownit({
    html: true,          // Enable HTML tags in source
    linkify: true,       // Autoconvert URL-like text to links
    typographer: true,   // Enable some language-neutral replacements + quotes beautification
    breaks: true         // Convert '\n' in paragraphs into <br>
})
.use(window.markdownitMark) // For strikethrough
.use(window.markdownitIns); // For underline

const formatResponse = (response) => {
    // Convert Markdown to HTML using markdown-it with plugins
    return md.render(response);
};

const showLoadingIndicator = () => {
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("gemini-response", "flex", "justify-start", "gap-2", "loading-indicator");
    loadingElement.innerHTML = `
        <div class="chat-body-inner right rounded-lg p-2.5 text-gray-200">
            <p>Gemini is typing...</p>
        </div>
    `;
    chatContainer.appendChild(loadingElement);
    return loadingElement;
};

const removeLoadingIndicator = (loadingElement) => {
    if (chatContainer.contains(loadingElement)) {
        chatContainer.removeChild(loadingElement);
    }
};

const scrollToBottom = () => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
};

const getChatResponse = async(loadingElement) => {
    const userText = chatInput.value;
    const selectedPersona = personaSelect.value;
    const model = getModel(selectedPersona);
    console.log("User Type: ", userText);
    console.log("Selected Persona: ", selectedPersona);

    const paragraphElement = document.createElement("div");

    try {
        const result = await model.generateContent(userText, selectedPersona);
        console.log("Response: ", result);
        const response = await result.response.text();
        console.log("Response (Str): ", response);

        const personaName = personaNames[selectedPersona] || selectedPersona;

        paragraphElement.classList.add("gemini-response", "flex", "flex-row", "justify-start", "gap-2");
        paragraphElement.setAttribute("data-persona", selectedPersona); // Set data-persona attribute
        paragraphElement.innerHTML = `
        <div class="flex flex-col">
        <div class="persona-name text-gray-400 text-sm px-2.5">${personaName}</div>
        <div class="chat-body-inner right rounded-lg p-2.5 text-gray-200">
            ${formatResponse(response)}
        </div>
        </div>
        `;
    } catch (error) {
        paragraphElement.classList.add("gemini-response", "error");
        console.error("Error fetching gemini response", error);

        let errorMessage = "I'm sorry, I couldn't generate a response at the moment. Please try again later.";
        if (error.message.includes("NetworkError")) {
            errorMessage = "Network error occurred. Please check your connection and try again.";
        } else if (error.message.includes("Rate limit exceeded")) {
            errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
        }

        paragraphElement.innerHTML = `
        <div class="chat-body-inner p-2.5 text-gray-200">
            <p>${errorMessage}</p>
            <button class="retry-button bg-gray-600 rounded-lg p-2.5 text-gray-200 mt-2">Retry</button>
        </div>
        `;

        paragraphElement.querySelector(".retry-button").addEventListener("click", () => {
            chatContainer.removeChild(paragraphElement);
            handleAPI();
        });
    } finally {
        removeLoadingIndicator(loadingElement);
        scrollToBottom();
    }

    chatContainer.appendChild(paragraphElement);
    scrollToBottom();
};

const handleAPI = () => {
    const userText = chatInput.value.trim();
    if (!userText) return;

    const chatBubble = document.createElement("div");
    chatBubble.classList.add("user-content", "flex", "justify-end", "gap-2"); 
    chatBubble.innerHTML = `
        <div class="chat-body-inner bg-gray-600 rounded-lg p-2.5 text-gray-200 w-max">
            <p>${userText}</p>
        </div>
    `;

    chatContainer.appendChild(chatBubble);
    scrollToBottom();

    const loadingElement = showLoadingIndicator();
    getChatResponse(loadingElement).finally(() => removeLoadingIndicator(loadingElement));

    chatInput.value = '';
};

sendMessage.addEventListener('click', handleAPI);

chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent adding a new line
        handleAPI();
    }
});
