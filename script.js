import { getModel, model } from "./mainmodule.js";

const chatInput = document.querySelector('#chat-input');
const sendMessage = document.querySelector('#chat-send');
const chatContainer = document.querySelector('.chat-cont');
const personaSelect = document.querySelector('#persona');
const welcomeScreen = document.querySelector('#welcome-screen');
const suggestedPromptsContainer = document.querySelector('.suggested-prompts-container');

const body = document.querySelector('body');
const filter = document.querySelector('#filter-R');

const personaNames = {
    peter: "Peter Griffin",
    rick: "Rick Astley",
    scary: "Evil Larry",
    ted: "Ted Failon",
    rizal: "Jose Rizal",
    special: "3301",
    question1: "3301",
    question2: "3301",
    question3: "3301",
    question4: "3301",
    question5: "3301"
};

const answers = [
    '3301',
    'skibidi toilet',
    'mason ako',
    'chipi chipi chapa chapa',
    'you are my sunshine',
    'do you know the way',
    'question',
    'next',
];

const borderColors = [
    "border-green-400 text-green-400",
    "border-yellow-400 text-yellow-400",
    "border-purple-400 text-purple-400",
    "border-red-400 text-red-400",
    "border-pink-400 text-pink-400",
    "border-indigo-400 text-indigo-400",
    "border-blue-400 text-blue-400"
];

const icons = {
    joke: "mood",
    weather: "wb_sunny",
    fact: "lightbulb",
    story: "book",
    movie: "movie",
    pets: "pets",
    food: "restaurant",
    interesting: "star",
    book: "menu_book",
    music: "music_note",
    hobby: "sports_esports",
    riddle: "help"
};

const getIconForPrompt = (prompt) => {
    if (prompt.toLowerCase().includes("joke")) return icons.joke;
    if (prompt.toLowerCase().includes("weather")) return icons.weather;
    if (prompt.toLowerCase().includes("fact")) return icons.fact;
    if (prompt.toLowerCase().includes("story")) return icons.story;
    if (prompt.toLowerCase().includes("movie")) return icons.movie;
    if (prompt.toLowerCase().includes("pets")) return icons.pets;
    if (prompt.toLowerCase().includes("food")) return icons.food;
    if (prompt.toLowerCase().includes("interesting")) return icons.interesting;
    if (prompt.toLowerCase().includes("book")) return icons.book;
    if (prompt.toLowerCase().includes("music")) return icons.music;
    if (prompt.toLowerCase().includes("hobby")) return icons.hobby;
    if (prompt.toLowerCase().includes("riddle")) return icons.riddle;
    return "chat";
};

const generateAISuggestions = async () => {
    var personaModel = 'suggestion';
    const model = getModel(personaModel);
    const prompt = "Generate some interesting conversation starters for a chatbot.";
    const result = await model.generateContent(prompt, personaModel);
    const response = await result.response.text();
    return response.split('\n').filter(line => line.trim() !== '');
};

// Display random suggestions
const displayRandomSuggestions = async () => {
    const aiSuggestions = await generateAISuggestions();
    const selectedSuggestions = aiSuggestions.slice(0, 4);
    suggestedPromptsContainer.innerHTML = '';
    selectedSuggestions.forEach(suggestion => {
        const borderColor = borderColors[Math.floor(Math.random() * borderColors.length)];
        const icon = getIconForPrompt(suggestion);
        const card = document.createElement('div');
        card.classList.add('suggested-prompt-card', 'bg-gray-800', 'p-4', 'rounded-lg', 'hover:bg-gray-700', 'cursor-pointer', 'border', ...borderColor.split(' '));
        card.setAttribute('data-prompt', suggestion);
        card.innerHTML = `
            <span class="material-symbols-rounded text-4xl mb-2 ${borderColor.split(' ')[1]}">${icon}</span>
            <p class="${borderColor.split(' ')[1]}">${suggestion}</p>
        `;
        card.addEventListener('click', () => {
            handleSuggestedPrompt(suggestion);
        });
        suggestedPromptsContainer.appendChild(card);
    });
};

// Initialize markdown-it with plugins
const md = window.markdownit({ html: true, linkify: true, typographer: true, breaks: true })
    .use(window.markdownitMark)
    .use(window.markdownitIns);

const formatResponse = (response) => md.render(response);

// Helper function to create a delay
const delay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

// Function to show typing indicator
const showLoadingIndicator = (selectedPersona) => {
    const personaName = personaNames[selectedPersona] || selectedPersona;
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("gemini-response", "flex", "justify-start", "gap-2", "loading-indicator");
    loadingElement.setAttribute("data-persona", selectedPersona); // Set data-persona attribute
    loadingElement.innerHTML = `
        <div class="flex flex-col">
            <div class="persona-name text-gray-400 text-sm px-2.5">${personaName}</div>
            <div class="chat-body-inner right rounded-lg p-2.5 text-gray-200 w-max">
                <p class="typing-animation">${personaName} is typing</p>
            </div>
        </div>
    `;
    chatContainer.appendChild(loadingElement);
    scrollToBottom();
    return loadingElement;
};

// Function to remove typing indicator
const removeLoadingIndicator = (loadingElement) => {
    if (chatContainer.contains(loadingElement)) {
        chatContainer.removeChild(loadingElement);
    }
};

// Function to scroll the chat to the latest message
const scrollToBottom = () => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
};

// Function to process and display chatbot responses sentence by sentence
const processChatResponse = async (response, selectedPersona) => {
    const personaName = personaNames[selectedPersona] || selectedPersona;
    const sentences = response.split('\n'); // Split response into sentences
    for (const sentence of sentences) {
        if (sentence.trim() === '') continue;

        await delay(500, 1500); // Add delay between sentences

        const responseBubble = document.createElement("div");
        responseBubble.classList.add("gemini-response", "flex", "flex-row", "justify-start", "gap-2");
        responseBubble.setAttribute("data-persona", selectedPersona); // Set data-persona attribute
        responseBubble.innerHTML = `
            <div class="flex flex-col w-11/12">
                <div class="persona-name text-gray-400 text-sm px-2.5">${personaName}</div>
                <div class="chat-body-inner right rounded-lg p-2.5 text-gray-200">
                    ${formatResponse(sentence)}
                </div>
            </div>
        `;
        chatContainer.appendChild(responseBubble);
        scrollToBottom();
    }
};

// Function to fetch chatbot response
const getChatResponse = async (loadingElement, userText = chatInput.value.trim(), isHidden = false) => {
    const selectedPersona = personaSelect.value;
    const model = getModel(selectedPersona);

    if (!userText) return;

    if (!isHidden) {
        chatInput.value = '';
    }

    console.log("User Input:", userText);
    console.log("Selected Persona:", selectedPersona);

    try {
        const result = await model.generateContent(userText, selectedPersona);
        const response = await result.response.text();

        console.log("Chatbot Response:", response);

        // Simulate a realistic typing delay before removing the typing indicator
        await delay(500, 1500);
        removeLoadingIndicator(loadingElement);

        // Process the response sentence by sentence
        await processChatResponse(response, selectedPersona);

    } catch (error) {
        console.error("Error fetching chatbot response:", error);

        const errorMessage = error.message.includes("NetworkError") 
            ? "Network error occurred. Please check your connection and try again."
            : error.message.includes("Rate limit exceeded") 
            ? "Rate limit exceeded. Please wait a moment and try again."
            : "I'm sorry, I couldn't generate a response at the moment. Please try again later.";

        removeLoadingIndicator(loadingElement);

        const errorBubble = document.createElement("div");
        errorBubble.classList.add("gemini-response", "error");
        errorBubble.innerHTML = `
            <div class="chat-body-inner p-2.5 text-gray-200">
                <p>${errorMessage}</p>
                <button class="retry-button bg-gray-600 rounded-lg p-2.5 text-gray-200 mt-2">Retry</button>
            </div>
        `;

        chatContainer.appendChild(errorBubble);
        scrollToBottom();

        errorBubble.querySelector(".retry-button").addEventListener("click", () => {
            chatContainer.removeChild(errorBubble);
            handleAPI();
        });
    }
};

const randomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
};

const recursive = async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const option = document.getElementById('random');
    let counter = 9999;

    while (counter > 0 || !flagDone) {
        option.text = randomString(8);
        await delay(50);
        counter--;

        if (flagDone) {
            break;
        }
    }
};

// Handle fail attempts of the user that triggers the jumpscare 
let failAttempts = 0;
const jumpscareScene = document.querySelector('.jumpscare');
const audioScare = new Audio('https://www.myinstants.com/media/sounds/flashbanggg.mp3');
let baseProbability = 0.005; // 0.05%
let increment = 0.04; // 0.015%

// Show jumpscare through rng. Increase the likelihood of showing the jumpscare scene as the user fails more attempts
const showJumpscare = () => {
    const rng = Math.random();
    if (rng < baseProbability + (failAttempts * increment)) { 
        jumpscareScene.classList.add('active');
        audioScare.play();
        setTimeout(() => {
            jumpscareScene.classList.remove('active');
        }, 3000);
    }
};

let flagDone = false;
let selectedPersona = personaSelect.value;
let correctAnswers = 0;
let specialEvent = false;

const audio1 = new Audio('./resources/audio/audio1.mp3');
const audio2 = new Audio('./resources/audio/audio2.mp3');
const audio3 = new Audio('./resources/audio/audio3.mp3');

const handleFailure = () => {
    failAttempts++;

    showJumpscare();
    console.log("Base Probability:", baseProbability + (failAttempts * increment)); // Increment by 0.005%
    console.log("Failure triggered, fail attempts:", failAttempts);
    const glitchOverlay = document.querySelector('.glitch-overlay');
    const chatContent = document.querySelector('.chat-cont');
    const textArea = document.querySelector('.chat-textarea');

    if (glitchOverlay && chatContent) {
        glitchOverlay.classList.add('active');
        chatContent.classList.add('active');
        textArea.classList.add('active');
        textArea.value = 'Try Again';

        // Play audio

        audio1.volume = 0.3;
        audio2.volume = 0.8;
        audio3.volume = 1;
        
        audio1.play();

        setTimeout(() => {
            audio1.pause();
        }, 3500);
        audio2.play();
        audio3.play();
        
        setTimeout(() => {
            glitchOverlay.classList.remove('active');
            chatContent.classList.remove('active');
            textArea.classList.remove('active');
            textArea.value = '';
        }, 3500); // Duration of the glitch effect
    } else {
        console.error("Glitch overlay or chat content element not found");
    }
};

// Function to handle user input and process chatbot responses
const handleAPI = async () => {
    const userText = chatInput.value.trim();
    const specialPersona = document.getElementById('random');
    selectedPersona = personaSelect.value; // Update selectedPersona dynamically

    if (!userText) return;
    
    if (userText.toLowerCase() === "3301") {
        selectedPersona = 'question1';
        specialPersona.value = 'question1';
        correctAnswers++; 
    } else if (userText.toLowerCase() == answers[1].toLocaleLowerCase() && correctAnswers === 1) {
        selectedPersona = 'question2'; 
        specialPersona.value = 'question2'; 
        correctAnswers++;
    } else if (userText.toLowerCase() == answers[2].toLocaleLowerCase() && correctAnswers === 2) {
        selectedPersona = 'question3'; 
        specialPersona.value = 'question3'; 
        correctAnswers++;
    } else if (userText.toLowerCase() == answers[3].toLocaleLowerCase() && correctAnswers === 3) {
        selectedPersona = 'question4'; 
        specialPersona.value = 'question4'; 
        correctAnswers++;
    } else if (userText.toLowerCase() == answers[4].toLocaleLowerCase() && correctAnswers === 4) {
        selectedPersona = 'question5'; 
        specialPersona.value = 'question5';
        correctAnswers++; 
    } else if (userText.toLowerCase() == answers[5].toLocaleLowerCase() && correctAnswers === 5) {
        audioAmbient.pause();
        flagDone = true;
        selectedPersona = 'peter';
        personaSelect.value = 'peter';
        
        // Show the welcome screen again like nothing happen
        let options = document.getElementById('persona');
        chatContainer.innerHTML = '';
        options.disabled = false;
        chatInput.value = '';
        
        // Play audio
        const audio = new Audio('./resources/amazing-audio.mp3');
        audio.play();
        
        body.classList.remove('crt');
        filter.classList.remove('red');

        specialEvent = false;
        correctAnswers = 0;
        failAttempts = 0;

        return;
    } 
    
    if (!answers.includes(userText.toLowerCase()) && specialEvent && !flagDone) {
        handleFailure();    
    }
    
    // Special event trigger
    if (userText.toLowerCase() === "nothing happened in 1989") {
        selectedPersona = 'special';
        console.log("Selected Persona:", selectedPersona);
        triggerSpecialEvent();
        
        let options = document.getElementById('persona');
        options.disabled = true;
        
        personaSelect.value = 'special';
        
        chatInput.value = '';

        specialEvent = true;
        return;
    }
    
    // Hide welcome screen if visible
    if (!welcomeScreen.classList.contains('hidden')) {
        welcomeScreen.classList.add('hidden');
    }
    
    // Display user message
    const chatBubble = document.createElement("div");
    chatBubble.classList.add("user-content", "flex", "justify-end", "gap-2"); 
    chatBubble.innerHTML = `
    <div class="chat-body-inner bg-gray-600 rounded-lg p-2.5 text-gray-200">
    <p>${userText}</p>
    </div>
    `;
    chatContainer.appendChild(chatBubble);
    scrollToBottom();
    
    // Show typing indicator and get chatbot response after delay
    const loadingElement = showLoadingIndicator(selectedPersona);
    await getChatResponse(loadingElement);
};

const audioAmbient = new Audio('./resources/audio/audio-ambient.mp3');
// Function to trigger special event
const triggerSpecialEvent = () => {
    audioAmbient.play();

    body.classList.add('crt');
    filter.classList.add('red');

    const specialEventMessage = `
    <div class="gemini-response flex justify-start gap-2" data-persona="${selectedPersona}">
    <div class="flex flex-col w-4/5">
    <div class="chat-body-inner right rounded-lg p-2.5 text-gray-200 bg-gray-800">
    <p class="text-md">You shouldn't have said that...</p>
    </div>
    </div>
    </div>
    `;
    chatContainer.innerHTML = specialEventMessage;
    
    
    recursive();
    scrollToBottom();
    
    const stareScreen = document.getElementById('stare');
    stareScreen.classList.add('start');
    
};

// Function to handle suggested prompts
const handleSuggestedPrompt = (prompt) => {
    chatInput.value = prompt;
    welcomeScreen.classList.add('hidden');
    handleAPI();
};

let idleTimeout;
const idleTimeLimit = 60000; // 1 minute

const resetIdleTimer = () => {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
        handleIdleState();
    }, idleTimeLimit);
};

const handleIdleState = () => {
    const hiddenInput = "User is idle. Tell them if they are still here?";
    const loadingElement = showLoadingIndicator(selectedPersona);
    getChatResponse(loadingElement, hiddenInput, true);
};

// Event listeners
sendMessage.addEventListener('click', handleAPI);
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleAPI();
    }
    resetIdleTimer();
});

document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);

// Display random suggestions on page load
displayRandomSuggestions();
resetIdleTimer();

// New Chat button
const newChatButton = document.querySelector('#start-conversation');

newChatButton.addEventListener('click', () => {
    location.reload();
});