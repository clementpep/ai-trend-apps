// ClickMind - AI Click Prediction Game

const state = {
    round: 0,
    aiWins: 0,
    humanWins: 0,
    clickHistory: [],
    currentPrediction: null,
    isThinking: false,
    minRoundsForAI: 3 // AI starts predicting after 3 clicks
};

// DOM Elements
const elements = {
    round: document.getElementById('round'),
    aiWins: document.getElementById('ai-wins'),
    humanWins: document.getElementById('human-wins'),
    accuracy: document.getElementById('accuracy'),
    gameMessage: document.getElementById('game-message'),
    gameBoard: document.getElementById('game-board'),
    cells: document.querySelectorAll('.cell'),
    aiThinking: document.getElementById('ai-thinking'),
    aiPrediction: document.getElementById('ai-prediction'),
    predictionText: document.getElementById('prediction-text'),
    historySection: document.getElementById('history-section'),
    historyList: document.getElementById('history-list'),
    insightSection: document.getElementById('insight-section'),
    aiInsight: document.getElementById('ai-insight')
};

// Initialize game
function init() {
    elements.cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    updateUI();
}

// Handle cell click
async function handleCellClick(e) {
    if (state.isThinking) return;
    
    const clickedIndex = parseInt(e.target.dataset.index);
    const clickedNumber = clickedIndex + 1;
    
    // Animate click
    e.target.classList.add('clicked');
    setTimeout(() => e.target.classList.remove('clicked'), 400);
    
    state.round++;
    
    // Check if AI predicted correctly
    if (state.currentPrediction !== null) {
        const aiCorrect = state.currentPrediction === clickedNumber;
        
        if (aiCorrect) {
            state.aiWins++;
            e.target.classList.add('ai-correct');
            elements.gameMessage.textContent = `🤖 AI wins! It predicted ${clickedNumber} correctly!`;
            addHistoryItem(clickedNumber, true);
        } else {
            state.humanWins++;
            e.target.classList.add('human-won');
            elements.gameMessage.textContent = `🎉 You win! AI guessed ${state.currentPrediction}, but you clicked ${clickedNumber}`;
            
            // Show where AI predicted
            const predictedCell = document.querySelector(`[data-index="${state.currentPrediction - 1}"]`);
            if (predictedCell) {
                predictedCell.classList.add('ai-predicted');
            }
            
            addHistoryItem(clickedNumber, false);
        }
        
        // Clean up classes after delay
        setTimeout(() => {
            elements.cells.forEach(c => {
                c.classList.remove('ai-correct', 'human-won', 'ai-predicted');
            });
        }, 1500);
    } else {
        // First few rounds - just recording
        elements.gameMessage.textContent = `Recorded: ${clickedNumber}. Keep clicking...`;
        addHistoryItem(clickedNumber, null);
    }
    
    // Record click
    state.clickHistory.push(clickedNumber);
    
    // Update UI
    updateUI();
    
    // Hide current prediction
    elements.aiPrediction.classList.add('hidden');
    state.currentPrediction = null;
    
    // Make next prediction if enough data
    if (state.clickHistory.length >= state.minRoundsForAI) {
        await makeAIPrediction();
    } else {
        const remaining = state.minRoundsForAI - state.clickHistory.length;
        elements.gameMessage.textContent = `Click ${remaining} more time${remaining > 1 ? 's' : ''} before AI starts predicting...`;
    }
}

// Make AI prediction using the API
async function makeAIPrediction() {
    state.isThinking = true;
    elements.aiThinking.classList.remove('hidden');
    elements.gameMessage.textContent = 'AI is analyzing your patterns...';
    
    // Disable cells while thinking
    elements.cells.forEach(c => c.disabled = true);
    
    try {
        const prediction = await getAIPrediction();
        state.currentPrediction = prediction;
        
        elements.aiThinking.classList.add('hidden');
        elements.aiPrediction.classList.remove('hidden');
        elements.predictionText.textContent = prediction;
        elements.gameMessage.textContent = `AI made its prediction! Now click a cell...`;
        
        // Get insight after some rounds
        if (state.round >= 5 && state.round % 3 === 0) {
            getAIInsight();
        }
    } catch (error) {
        console.error('AI prediction failed:', error);
        // Fallback to simple prediction
        state.currentPrediction = getSimplePrediction();
        
        elements.aiThinking.classList.add('hidden');
        elements.aiPrediction.classList.remove('hidden');
        elements.predictionText.textContent = state.currentPrediction;
        elements.gameMessage.textContent = `AI made its prediction! Now click a cell...`;
    }
    
    state.isThinking = false;
    elements.cells.forEach(c => c.disabled = false);
}

// Call AI API for prediction
async function getAIPrediction() {
    const history = state.clickHistory.slice(-10).join(', ');
    const patterns = analyzePatterns();
    
    const prompt = `You're analyzing click patterns in a 3x3 grid (numbered 1-9, left to right, top to bottom).

Recent click history: [${history}]
Pattern analysis:
- Most clicked: ${patterns.mostClicked}
- Least clicked: ${patterns.leastClicked}
- Last 3 moves: ${state.clickHistory.slice(-3).join(' → ')}
- Common sequences: ${patterns.sequences}

Based on human psychological tendencies (avoiding repetition, preferring certain positions, subconscious patterns), predict the SINGLE NUMBER (1-9) the user will most likely click next.

Respond with ONLY a single digit 1-9, nothing else.`;

    const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: 'You are an expert at predicting human behavior patterns. Respond only with a single digit.' },
                { role: 'user', content: prompt }
            ],
            model: 'gpt-4o-mini',
            max_tokens: 5
        })
    });
    
    const data = await response.json();
    const prediction = parseInt(data.content?.trim());
    
    if (isNaN(prediction) || prediction < 1 || prediction > 9) {
        return getSimplePrediction();
    }
    
    return prediction;
}

// Get AI insight about player behavior
async function getAIInsight() {
    const history = state.clickHistory.join(', ');
    const patterns = analyzePatterns();
    
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a behavioral psychologist analyzing click patterns. Be concise and insightful.' },
                    { role: 'user', content: `Analyze this player's click patterns in a 3x3 grid: [${history}]. Most clicked: ${patterns.mostClicked}, Least clicked: ${patterns.leastClicked}. Give ONE interesting insight about their behavior in 1-2 sentences.` }
                ],
                model: 'gpt-4o-mini',
                max_tokens: 100
            })
        });
        
        const data = await response.json();
        if (data.content) {
            elements.insightSection.classList.remove('hidden');
            elements.aiInsight.textContent = data.content;
        }
    } catch (error) {
        console.error('Insight failed:', error);
    }
}

// Simple fallback prediction
function getSimplePrediction() {
    const counts = {};
    for (let i = 1; i <= 9; i++) counts[i] = 0;
    
    state.clickHistory.forEach(n => counts[n]++);
    
    // Predict less frequently clicked numbers (humans avoid repetition)
    const sortedByCount = Object.entries(counts)
        .sort((a, b) => a[1] - b[1]);
    
    // Pick from the 3 least clicked with some randomness
    const leastClicked = sortedByCount.slice(0, 3);
    return parseInt(leastClicked[Math.floor(Math.random() * leastClicked.length)][0]);
}

// Analyze patterns in click history
function analyzePatterns() {
    const counts = {};
    for (let i = 1; i <= 9; i++) counts[i] = 0;
    
    state.clickHistory.forEach(n => counts[n]++);
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const mostClicked = sorted.filter(([_, c]) => c === sorted[0][1]).map(([n]) => n).join(', ');
    const leastClicked = sorted.filter(([_, c]) => c === sorted[sorted.length - 1][1]).map(([n]) => n).join(', ');
    
    // Find common sequences
    const sequences = [];
    for (let i = 0; i < state.clickHistory.length - 1; i++) {
        sequences.push(`${state.clickHistory[i]}→${state.clickHistory[i + 1]}`);
    }
    const seqCounts = {};
    sequences.forEach(s => seqCounts[s] = (seqCounts[s] || 0) + 1);
    const commonSeqs = Object.entries(seqCounts)
        .filter(([_, c]) => c > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([s]) => s)
        .join(', ') || 'none yet';
    
    return { mostClicked, leastClicked, sequences: commonSeqs };
}

// Add item to history
function addHistoryItem(number, aiWon) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = number;
    
    if (aiWon === true) {
        item.classList.add('ai-won');
    } else if (aiWon === false) {
        item.classList.add('human-won');
    }
    
    elements.historyList.appendChild(item);
    elements.historySection.classList.remove('hidden');
    
    // Scroll to end
    elements.historyList.parentElement.scrollLeft = elements.historyList.scrollWidth;
}

// Update UI
function updateUI() {
    elements.round.textContent = state.round;
    elements.aiWins.textContent = state.aiWins;
    elements.humanWins.textContent = state.humanWins;
    
    const total = state.aiWins + state.humanWins;
    const accuracy = total > 0 ? Math.round((state.aiWins / total) * 100) : 0;
    elements.accuracy.textContent = `${accuracy}%`;
}

// Reset game
function resetGame() {
    state.round = 0;
    state.aiWins = 0;
    state.humanWins = 0;
    state.clickHistory = [];
    state.currentPrediction = null;
    state.isThinking = false;
    
    elements.historyList.innerHTML = '';
    elements.historySection.classList.add('hidden');
    elements.aiPrediction.classList.add('hidden');
    elements.aiThinking.classList.add('hidden');
    elements.insightSection.classList.add('hidden');
    elements.gameMessage.textContent = 'Click any cell to start. The AI is watching... 👀';
    
    elements.cells.forEach(c => {
        c.classList.remove('ai-correct', 'human-won', 'ai-predicted', 'clicked');
        c.disabled = false;
    });
    
    updateUI();
}

// Initialize on load
init();
