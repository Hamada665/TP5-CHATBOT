/* SAKURABOT - LOGIC FINALE 🌸 */

const API_KEY = "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";
const MODEL_ID = "stepfun/step-3.5-flash:free";

// --- RÉCUPÉRATION DES ÉLÉMENTS ---
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const themeToggle = document.getElementById('theme-toggle'); // Ajouté
const soundToggle = document.getElementById('sound-toggle');
const sakuraContainer = document.getElementById('sakura-container'); // Ajouté

// --- 1. FONCTION DES PÉTALES (RÉPARÉ) ---
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    const size = Math.random() * 15 + 10 + 'px';
    petal.style.width = size;
    petal.style.height = size;
    petal.style.left = Math.random() * 100 + 'vw';
    const duration = Math.random() * 5 + 7 + 's';
    petal.style.animationDuration = duration;
    sakuraContainer.appendChild(petal);
    setTimeout(() => { petal.remove(); }, parseFloat(duration) * 1000);
}
// Lance l'animation
setInterval(createPetal, 450);

// --- 2. GESTION DU THÈME (RÉPARÉ) ---
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.innerText = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});

// --- 3. GESTION DU SON ---
let isSoundEnabled = false;
soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.innerText = isSoundEnabled ? '🔔' : '🔕';
    // Ajoute une petite classe pour le style si tu veux
    soundToggle.classList.toggle('active', isSoundEnabled);
    alert(isSoundEnabled ? "Notifications sonores activées (Konnichiwa! ✨)" : "Mode silencieux activé 🤫");
});

// --- 4. FONCTION D'ENVOI (IA + KAOMOJIS) ---
async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user-message');
    userInput.value = '';
    
    const botMsgId = 'bot-' + Date.now();
    addEmptyBotMessage(botMsgId);
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [
                    { 
                        role: "system", 
                        content: "Tu es SakuraBot, un assistant japonais poli et chaleureux. Tu dois IMPÉRATIVEMENT utiliser des kaomojis japonais (comme ^_^, (✿◠‿◠), (◕‿◕), ฅ^•ﻌ•^ฅ) dans chacune de tes réponses." 
                    },
                    { role: "user", content: text }
                ],
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    if (dataStr === '[DONE]') break;
                    try {
                        const data = JSON.parse(dataStr);
                        const content = data.choices[0].delta.content || "";
                        fullText += content;
                        document.getElementById(botMsgId).innerHTML = marked.parse(fullText);
                        typingIndicator.classList.add('hidden');
                        scrollToBottom();
                    } catch (e) {}
                }
            }
        }
    } catch (error) {
        typingIndicator.classList.add('hidden');
        console.error("Erreur:", error);
    }
}

// --- UTILITAIRES ---
function addMessage(text, className) {
    const div = document.createElement('div');
    div.className = `message ${className} fade-in`;
    div.innerHTML = `<div class="message-content">${marked.parse(text)}</div>`;
    chatMessages.appendChild(div);
}

function addEmptyBotMessage(id) {
    const div = document.createElement('div');
    div.className = `message bot-message fade-in`;
    div.innerHTML = `<div class="message-content" id="${id}">...</div>`;
    chatMessages.appendChild(div);
}

function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }

sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });
