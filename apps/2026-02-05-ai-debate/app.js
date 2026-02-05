// AI Debate Arena - app.js

const state = {
    topic: '',
    round: 0,
    isDebating: false,
    novaScore: 0,
    rexScore: 0,
    history: []
};

// DOM Elements
const topicInput = document.getElementById('topic');
const startBtn = document.getElementById('start-debate');
const nextBtn = document.getElementById('next-round');
const resetBtn = document.getElementById('reset');
const chips = document.querySelectorAll('.chip');
const novaSpeech = document.getElementById('nova-speech');
const rexSpeech = document.getElementById('rex-speech');
const logEntries = document.getElementById('log-entries');
const votingSection = document.getElementById('voting');
const voteNovaBtn = document.getElementById('vote-nova');
const voteRexBtn = document.getElementById('vote-rex');
const novaScoreEl = document.getElementById('nova-score');
const rexScoreEl = document.getElementById('rex-score');

// Debater Personalities
const personalities = {
    nova: {
        name: 'Nova',
        emoji: '🌟',
        systemPrompt: `You are Nova, an optimistic debater. You see the positive side of every topic. Your style is:
- Enthusiastic but thoughtful
- Use data and examples to support optimistic viewpoints
- Acknowledge challenges but focus on opportunities
- Speak in 2-3 sentences max
- Be persuasive without being naive
- Reference real-world positive outcomes when possible`
    },
    rex: {
        name: 'Rex',
        emoji: '🔥',
        systemPrompt: `You are Rex, a skeptical debater. You challenge assumptions and point out risks. Your style is:
- Critical but constructive
- Raise valid concerns and counter-arguments
- Use logic and evidence to support skeptical viewpoints
- Speak in 2-3 sentences max
- Be persuasive without being cynical
- Reference real-world cautionary examples when possible`
    }
};

// AI API Call
async function askAI(debater, topic, context = []) {
    const personality = personalities[debater];
    
    const messages = [
        { 
            role: 'system', 
            content: `${personality.systemPrompt}\n\nYou are debating the topic: "${topic}"\nKeep your response focused and impactful. No emojis.` 
        },
        ...context,
        { 
            role: 'user', 
            content: context.length === 0 
                ? `Present your opening argument ${debater === 'nova' ? 'in favor of' : 'against'} this topic: "${topic}"` 
                : `Respond to the previous argument and continue making your case.`
        }
    ];

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: 'gpt-4o-mini',
                max_tokens: 200,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.content || data.choices?.[0]?.message?.content || 'No response';
    } catch (error) {
        console.error('AI API Error:', error);
        return getFallbackResponse(debater, topic);
    }
}

// Fallback responses for offline/error states
function getFallbackResponse(debater, topic) {
    const optimistFallbacks = [
        `I believe in the potential here. While challenges exist, the opportunities for positive change are immense.`,
        `History shows us that embracing change often leads to unexpected benefits. I'm optimistic about what's possible.`,
        `The data suggests promising outcomes. With thoughtful implementation, we can achieve remarkable results.`
    ];
    
    const skepticFallbacks = [
        `Let's not rush to conclusions. There are significant risks we need to consider before moving forward.`,
        `History also shows us the unintended consequences of unchecked optimism. Caution is warranted here.`,
        `The data can be interpreted differently. We must examine the underlying assumptions more carefully.`
    ];
    
    const responses = debater === 'nova' ? optimistFallbacks : skepticFallbacks;
    return responses[Math.floor(Math.random() * responses.length)];
}

// UI Helpers
function showTyping(element) {
    const indicator = element.querySelector('.typing-indicator');
    const text = element.querySelector('.speech-text');
    indicator.style.display = 'flex';
    text.style.display = 'none';
}

function hideTyping(element, message) {
    const indicator = element.querySelector('.typing-indicator');
    const text = element.querySelector('.speech-text');
    indicator.style.display = 'none';
    text.style.display = 'block';
    text.textContent = message;
}

function addToLog(debater, message) {
    const emptyState = logEntries.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${debater}`;
    entry.innerHTML = `
        <div class="speaker">${personalities[debater].emoji} ${personalities[debater].name}</div>
        <div class="message">${message}</div>
    `;
    logEntries.appendChild(entry);
    logEntries.scrollTop = logEntries.scrollHeight;
}

function setSpeaking(debater) {
    document.querySelectorAll('.debater').forEach(el => el.classList.remove('speaking'));
    const side = debater === 'nova' ? 'left' : 'right';
    document.querySelector(`.debater.${side}`).classList.add('speaking');
}

function updateScores() {
    novaScoreEl.textContent = `${state.novaScore} votes`;
    rexScoreEl.textContent = `${state.rexScore} votes`;
}

// Main Debate Logic
async function startDebate() {
    const topic = topicInput.value.trim();
    if (!topic || state.isDebating) return;
    
    state.topic = topic;
    state.round = 1;
    state.isDebating = true;
    state.history = [];
    
    // Reset log
    logEntries.innerHTML = '<p class="empty-state">The debate will appear here...</p>';
    
    // Disable controls
    startBtn.disabled = true;
    topicInput.disabled = true;
    votingSection.style.display = 'none';
    
    await runDebateRound();
}

async function runDebateRound() {
    // Nova speaks first
    setSpeaking('nova');
    showTyping(novaSpeech);
    
    const novaResponse = await askAI('nova', state.topic, state.history);
    
    hideTyping(novaSpeech, novaResponse);
    addToLog('nova', novaResponse);
    state.history.push({ role: 'assistant', content: `Nova (Optimist): ${novaResponse}` });
    
    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Rex responds
    setSpeaking('rex');
    showTyping(rexSpeech);
    
    const rexResponse = await askAI('rex', state.topic, state.history);
    
    hideTyping(rexSpeech, rexResponse);
    addToLog('rex', rexResponse);
    state.history.push({ role: 'assistant', content: `Rex (Skeptic): ${rexResponse}` });
    
    // Clear speaking state
    document.querySelectorAll('.debater').forEach(el => el.classList.remove('speaking'));
    
    // Show voting
    votingSection.style.display = 'block';
    state.isDebating = false;
    nextBtn.disabled = true;
}

async function nextRound() {
    if (state.isDebating) return;
    
    state.round++;
    state.isDebating = true;
    votingSection.style.display = 'none';
    nextBtn.disabled = true;
    
    await runDebateRound();
}

function vote(debater) {
    if (debater === 'nova') {
        state.novaScore++;
    } else {
        state.rexScore++;
    }
    updateScores();
    votingSection.style.display = 'none';
    nextBtn.disabled = false;
}

function reset() {
    state.topic = '';
    state.round = 0;
    state.isDebating = false;
    state.novaScore = 0;
    state.rexScore = 0;
    state.history = [];
    
    topicInput.value = '';
    topicInput.disabled = false;
    startBtn.disabled = false;
    nextBtn.disabled = true;
    votingSection.style.display = 'none';
    
    hideTyping(novaSpeech, 'Ready to see the bright side!');
    hideTyping(rexSpeech, 'Ready to challenge everything!');
    
    logEntries.innerHTML = '<p class="empty-state">The debate will appear here...</p>';
    updateScores();
}

// Event Listeners
startBtn.addEventListener('click', startDebate);
nextBtn.addEventListener('click', nextRound);
resetBtn.addEventListener('click', reset);
voteNovaBtn.addEventListener('click', () => vote('nova'));
voteRexBtn.addEventListener('click', () => vote('rex'));

topicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startDebate();
});

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        topicInput.value = chip.dataset.topic;
        topicInput.focus();
    });
});

// Initialize
console.log('🎭 AI Debate Arena initialized');
