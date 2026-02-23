/* PROJET : SakuraBot - Logic & AI Integration
  MODÈLE : Stepfun Step-3.5 Flash (Free)
*/

// --- CONFIGURATION ---
const API_KEY = "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";
const MODEL_ID = "stepfun/step-3.5-flash:free";

// --- ÉLÉMENTS DOM ---
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const themeToggle = document.getElementById('theme-toggle');
const sakuraContainer = document.getElementById('sakura-container');

// --- 1. ANIMATION DES PÉTALES (L'esprit Zen) ---
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    
    // Position et taille aléatoire
    const size = Math.random() * 10 + 10 + 'px';
    petal.style.width = size;
    petal.style.height = size;
    petal.style.left = Math.random() * 100 + 'vw';
    
    // Durée de chute aléatoire
    const duration = Math.random() * 5 + 5 + 's';
    petal.style.animationDuration = duration;

    sakuraContainer.appendChild(petal);

    // Supprimer le pétale après sa chute pour ne pas alourdir la page
    setTimeout(() => {
        petal.remove();
    }, parseFloat(duration) * 1000);
}

// Générer des pétales régulièrement
setInterval(createPetal, 400);

// --- 2. GESTION DU MODE SOMBRE (Kyoto Night) ---
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.innerText = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});

// --- 3. ENVOI DES MESSAGES ---
async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Ajouter le message utilisateur à l'écran
    addMessage(text, 'user-message');
    userInput.value = '';

    // Afficher l'indicateur de réflexion
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [{ role: "user", content: text }]
            })
        });

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        // Cacher le chargement et afficher la réponse du bot
        typingIndicator.classList.add('hidden');
        addMessage(botReply, 'bot-message');

    } catch (error) {
        typingIndicator.classList.add('hidden');
        addMessage("Désolé, une perturbation dans le vent empêche SakuraBot de répondre.", 'bot-message');
        console.error("Erreur API:", error);
    }
}

// --- 4. FONCTIONS UTILITAIRES ---
function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className, 'fade-in');
    
    // Heure actuelle
    const now = new Date();
    const timeString = now.getHours() + ":" + now.getMinutes().toString().padStart(2, '0');

    messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
        <span class="message-time">${timeString}</span>
    `;

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Écouteurs d'événements (Clic et Touche Entrée)
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});
