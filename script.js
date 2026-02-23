/* SAKURABOT - LOGIC V3 (Streaming & Markdown) */

const API_KEY = "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";
const MODEL_ID = "stepfun/step-3.5-flash:free";

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');

// --- FONCTION D'ENVOI AVEC EFFET DE FRAPPE (STREAMING) ---
async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user-message');
    userInput.value = '';
    
    // On crée une bulle vide pour le bot qui va se remplir petit à petit
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
                messages: [{ role: "user", content: text }],
                stream: true // Activation du mode streaming !
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
                        
                        // On met à jour la bulle avec le texte formaté en Markdown
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
