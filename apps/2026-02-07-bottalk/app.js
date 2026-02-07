// BotTalk - AI Agent Debates
// Inspired by Moltbook's viral agent-to-agent conversations

const chatContainer = document.getElementById('chat-container');
const startBtn = document.getElementById('start-btn');
const clearBtn = document.getElementById('clear-btn');

let isDebating = false;
let conversationHistory = [];

// AI API helper
async function askAI(messages) {
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: messages,
                model: 'gpt-4o-mini',
                max_tokens: 300,
                temperature: 0.9
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('AI API error:', error);
        return null;
    }
}

// Get agent configuration
function getAgentConfig(agentNum) {
    const name = document.getElementById(`agent${agentNum}-name`).value.trim() || `Agent ${agentNum}`;
    const persona = document.getElementById(`agent${agentNum}-persona`).value.trim() || 'A thoughtful debater';
    return { name, persona };
}

// Create message element
function createMessage(agentNum, name, text) {
    const message = document.createElement('div');
    message.className = `message agent-${agentNum}`;
    message.innerHTML = `
        <div class="message-avatar">${agentNum === 1 ? '🔵' : '🔴'}</div>
        <div class="message-content">
            <div class="message-name">${escapeHtml(name)}</div>
            <div class="message-text">${escapeHtml(text)}</div>
        </div>
    `;
    return message;
}

// Create typing indicator
function createTypingIndicator(agentNum) {
    const message = document.createElement('div');
    message.className = `message agent-${agentNum}`;
    message.id = 'typing-indicator';
    message.innerHTML = `
        <div class="message-avatar">${agentNum === 1 ? '🔵' : '🔴'}</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    return message;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Clear chat
function clearChat() {
    chatContainer.innerHTML = `
        <div class="chat-placeholder">
            <span>💬</span>
            <p>Set up your agents and start the debate!</p>
        </div>
    `;
    conversationHistory = [];
    isDebating = false;
    startBtn.classList.remove('loading');
    startBtn.disabled = false;
}

// Simulate typing delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the debate
async function startDebate() {
    if (isDebating) return;
    
    const topic = document.getElementById('topic').value.trim();
    if (!topic) {
        alert('Please enter a debate topic!');
        return;
    }
    
    isDebating = true;
    startBtn.classList.add('loading');
    startBtn.disabled = true;
    
    // Clear placeholder
    chatContainer.innerHTML = '';
    conversationHistory = [];
    
    const agent1 = getAgentConfig(1);
    const agent2 = getAgentConfig(2);
    
    // Number of exchanges
    const rounds = 3;
    
    for (let round = 0; round < rounds && isDebating; round++) {
        // Agent 1 speaks
        await generateResponse(1, agent1, agent2, topic, round === 0);
        if (!isDebating) break;
        
        await delay(500);
        
        // Agent 2 responds
        await generateResponse(2, agent2, agent1, topic, false);
        if (!isDebating) break;
        
        await delay(500);
    }
    
    startBtn.classList.remove('loading');
    startBtn.disabled = false;
    isDebating = false;
}

// Generate response for an agent
async function generateResponse(agentNum, currentAgent, otherAgent, topic, isFirst) {
    // Show typing indicator
    chatContainer.appendChild(createTypingIndicator(agentNum));
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Build system prompt
    const systemPrompt = `You are ${currentAgent.name}, a debate participant. Your personality: ${currentAgent.persona}.

You are debating with ${otherAgent.name} (who is: ${otherAgent.persona}) about: "${topic}"

Rules:
- Stay in character with your personality
- Keep responses concise (2-3 sentences max)
- Be engaging and somewhat provocative to keep the debate interesting
- Respond directly to what was said before (if applicable)
- Don't use emojis or markdown`;

    const messages = [
        { role: 'system', content: systemPrompt }
    ];
    
    if (isFirst) {
        messages.push({ 
            role: 'user', 
            content: `Start the debate by sharing your opening position on: "${topic}"` 
        });
    } else {
        // Add conversation history
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.agentNum === agentNum ? 'assistant' : 'user',
                content: `${msg.name}: ${msg.text}`
            });
        });
        messages.push({ 
            role: 'user', 
            content: 'Respond to the previous argument.' 
        });
    }
    
    const response = await askAI(messages);
    removeTypingIndicator();
    
    if (response) {
        // Clean up response (remove agent name prefix if AI included it)
        let cleanResponse = response.replace(new RegExp(`^${currentAgent.name}:\\s*`, 'i'), '');
        
        // Add message to chat
        const messageEl = createMessage(agentNum, currentAgent.name, cleanResponse);
        chatContainer.appendChild(messageEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Save to history
        conversationHistory.push({
            agentNum,
            name: currentAgent.name,
            text: cleanResponse
        });
    } else {
        // Fallback if API fails
        const fallbackResponses = {
            1: [
                "That's an interesting perspective, but I see it differently...",
                "I understand your point, however we must consider...",
                "While that's valid, the evidence suggests otherwise..."
            ],
            2: [
                "You raise a fair point, yet I must disagree...",
                "That's precisely the issue I wanted to address...",
                "An intriguing stance, but let me counter with this..."
            ]
        };
        
        const fallback = fallbackResponses[agentNum][Math.floor(Math.random() * 3)];
        const messageEl = createMessage(agentNum, currentAgent.name, fallback);
        chatContainer.appendChild(messageEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        conversationHistory.push({
            agentNum,
            name: currentAgent.name,
            text: fallback
        });
    }
}

// Event listeners
startBtn.addEventListener('click', startDebate);
clearBtn.addEventListener('click', clearChat);

// Allow Enter key to start debate from topic input
document.getElementById('topic').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isDebating) {
        startDebate();
    }
});
