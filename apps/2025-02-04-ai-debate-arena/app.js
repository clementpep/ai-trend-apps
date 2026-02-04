// AI Debate Arena - Two AI personalities debate any topic

const PERSONAS = {
    logic: {
        name: 'LOGOS',
        system: `You are LOGOS, an analytical debater. You argue with:
- Data, statistics, and logical reasoning
- Structured arguments (premises → conclusions)
- Historical precedents and research
- Cost-benefit analysis
- Calm, measured tone

Keep responses under 150 words. Be persuasive but respectful of the opposing view.`
    },
    creative: {
        name: 'PATHOS',
        system: `You are PATHOS, a creative visionary debater. You argue with:
- Emotional intelligence and human stories
- Future possibilities and imagination
- Ethical and moral considerations
- Cultural and social impact
- Passionate, inspiring tone

Keep responses under 150 words. Be persuasive but respectful of the opposing view.`
    }
};

let currentRound = 0;
let maxRounds = 3;
let currentTopic = '';
let debateHistory = [];

// DOM Elements
const topicInput = document.getElementById('topic');
const startBtn = document.getElementById('start-btn');
const arena = document.getElementById('arena');
const speechLogic = document.getElementById('speech-logic');
const speechCreative = document.getElementById('speech-creative');
const roundControls = document.getElementById('round-controls');
const roundNum = document.getElementById('round-num');
const nextRoundBtn = document.getElementById('next-round-btn');
const newDebateBtn = document.getElementById('new-debate-btn');
const verdict = document.getElementById('verdict');
const verdictText = document.getElementById('verdict-text');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    startBtn.addEventListener('click', startDebate);
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startDebate();
    });
    nextRoundBtn.addEventListener('click', nextRound);
    newDebateBtn.addEventListener('click', resetDebate);
    
    // Suggestion chips
    document.querySelectorAll('.suggestion').forEach(chip => {
        chip.addEventListener('click', () => {
            topicInput.value = chip.dataset.topic;
            topicInput.focus();
        });
    });
});

async function askAI(persona, prompt) {
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: persona.system },
                    ...debateHistory,
                    { role: 'user', content: prompt }
                ],
                model: 'gpt-4o-mini',
                max_tokens: 300
            })
        });
        
        if (!response.ok) throw new Error('API error');
        
        const data = await response.json();
        return data.content || data.choices?.[0]?.message?.content || 'No response';
    } catch (error) {
        console.error('AI API Error:', error);
        return generateFallbackResponse(persona, prompt);
    }
}

function generateFallbackResponse(persona, prompt) {
    // Fallback for local testing or API errors
    const fallbacks = {
        logic: [
            "From an analytical standpoint, we must consider the empirical evidence...",
            "The data suggests a more nuanced position. Studies have shown...",
            "Let's examine this through a cost-benefit lens..."
        ],
        creative: [
            "Imagine a world where this perspective transforms how we live...",
            "The human element here is crucial. Consider the stories of...",
            "What if we approached this with empathy and vision..."
        ]
    };
    
    const isLogic = persona.name === 'LOGOS';
    const options = isLogic ? fallbacks.logic : fallbacks.creative;
    return options[Math.floor(Math.random() * options.length)] + 
           " [Demo mode - API not available locally]";
}

async function startDebate() {
    const topic = topicInput.value.trim();
    if (!topic) {
        topicInput.focus();
        return;
    }
    
    currentTopic = topic;
    currentRound = 1;
    debateHistory = [];
    
    // UI Updates
    setLoading(true);
    arena.classList.remove('hidden');
    roundControls.classList.remove('hidden');
    verdict.classList.add('hidden');
    newDebateBtn.classList.add('hidden');
    nextRoundBtn.classList.remove('hidden');
    nextRoundBtn.disabled = true;
    roundNum.textContent = currentRound;
    
    showTyping('logic');
    showTyping('creative');
    
    // Start the debate - LOGOS opens
    const logicPrompt = `The debate topic is: "${topic}". You are arguing FOR this position in Round 1. Open the debate with your strongest argument.`;
    const logicResponse = await askAI(PERSONAS.logic, logicPrompt);
    
    debateHistory.push({ role: 'assistant', content: `[LOGOS Round 1]: ${logicResponse}` });
    displaySpeech('logic', logicResponse);
    
    // PATHOS responds
    const creativePrompt = `The debate topic is: "${topic}". You are arguing AGAINST this position. LOGOS just said: "${logicResponse}". Respond with your counter-argument.`;
    const creativeResponse = await askAI(PERSONAS.creative, creativePrompt);
    
    debateHistory.push({ role: 'assistant', content: `[PATHOS Round 1]: ${creativeResponse}` });
    displaySpeech('creative', creativeResponse);
    
    setLoading(false);
    nextRoundBtn.disabled = false;
}

async function nextRound() {
    currentRound++;
    roundNum.textContent = currentRound;
    
    if (currentRound > maxRounds) {
        endDebate();
        return;
    }
    
    nextRoundBtn.disabled = true;
    showTyping('logic');
    showTyping('creative');
    
    // LOGOS continues
    const logicPrompt = `Continue the debate on "${currentTopic}". This is Round ${currentRound}. Respond to PATHOS's previous argument and strengthen your position.`;
    const logicResponse = await askAI(PERSONAS.logic, logicPrompt);
    
    debateHistory.push({ role: 'assistant', content: `[LOGOS Round ${currentRound}]: ${logicResponse}` });
    displaySpeech('logic', logicResponse);
    
    // PATHOS responds
    const creativePrompt = `Continue the debate on "${currentTopic}". This is Round ${currentRound}. LOGOS just said: "${logicResponse}". Counter their argument.`;
    const creativeResponse = await askAI(PERSONAS.creative, creativePrompt);
    
    debateHistory.push({ role: 'assistant', content: `[PATHOS Round ${currentRound}]: ${creativeResponse}` });
    displaySpeech('creative', creativeResponse);
    
    nextRoundBtn.disabled = false;
    
    if (currentRound >= maxRounds) {
        nextRoundBtn.textContent = 'See Verdict 🏆';
    }
}

function endDebate() {
    verdict.classList.remove('hidden');
    nextRoundBtn.classList.add('hidden');
    newDebateBtn.classList.remove('hidden');
    
    verdictText.textContent = `Both LOGOS and PATHOS have shared their perspectives on "${currentTopic}". The best debates don't have winners—they expand our thinking.`;
}

function resetDebate() {
    currentRound = 0;
    currentTopic = '';
    debateHistory = [];
    topicInput.value = '';
    
    arena.classList.add('hidden');
    roundControls.classList.add('hidden');
    verdict.classList.add('hidden');
    nextRoundBtn.textContent = 'Next Round →';
    
    speechLogic.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    speechCreative.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    
    topicInput.focus();
}

function showTyping(side) {
    const element = side === 'logic' ? speechLogic : speechCreative;
    element.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
}

function displaySpeech(side, text) {
    const element = side === 'logic' ? speechLogic : speechCreative;
    element.innerHTML = '';
    
    // Typewriter effect
    let index = 0;
    const speed = 15;
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

function setLoading(isLoading) {
    startBtn.disabled = isLoading;
    const btnText = startBtn.querySelector('.btn-text');
    const btnLoader = startBtn.querySelector('.btn-loader');
    
    if (isLoading) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    } else {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}
