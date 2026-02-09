// ===== MOODFLOW - AI Mood Journal =====

const STORAGE_KEY = 'moodflow_history';
const MAX_HISTORY = 20;

// DOM Elements
const currentDateEl = document.getElementById('current-date');
const moodButtons = document.querySelectorAll('.mood-btn');
const journalEntry = document.getElementById('journal-entry');
const analyzeBtn = document.getElementById('analyze-btn');
const analysisResult = document.getElementById('analysis-result');
const analysisContent = document.getElementById('analysis-content');
const detectedMoodText = document.getElementById('detected-mood-text');
const analysisTime = document.getElementById('analysis-time');
const moodHistory = document.getElementById('mood-history');
const clearHistoryBtn = document.getElementById('clear-history');
const loadingOverlay = document.getElementById('loading-overlay');

// State
let selectedMood = null;

// ===== INITIALIZATION =====
function init() {
  setCurrentDate();
  setupMoodButtons();
  setupAnalyzeButton();
  setupClearHistory();
  loadHistory();
}

function setCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

// ===== MOOD SELECTION =====
function setupMoodButtons() {
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove previous selection
      moodButtons.forEach(b => b.classList.remove('selected'));
      // Add selection to clicked button
      btn.classList.add('selected');
      selectedMood = {
        mood: btn.dataset.mood,
        emoji: btn.dataset.emoji
      };
    });
  });
}

// ===== AI ANALYSIS =====
function setupAnalyzeButton() {
  analyzeBtn.addEventListener('click', async () => {
    const text = journalEntry.value.trim();
    
    if (!text && !selectedMood) {
      showError('Please select a mood or write something to analyze.');
      return;
    }

    await analyzeWithAI(text, selectedMood);
  });
}

async function analyzeWithAI(text, mood) {
  showLoading(true);

  const prompt = buildPrompt(text, mood);

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
        max_tokens: 400
      })
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    const aiResponse = data.content || data.message || 'Unable to analyze at this time.';

    // Display result
    displayAnalysis(aiResponse, mood);

    // Save to history
    saveToHistory({
      mood: mood?.mood || 'unspecified',
      emoji: mood?.emoji || '📝',
      text: text || 'Quick mood check',
      analysis: aiResponse,
      timestamp: Date.now()
    });

    // Reset form
    journalEntry.value = '';
    moodButtons.forEach(b => b.classList.remove('selected'));
    selectedMood = null;

  } catch (error) {
    console.error('AI analysis error:', error);
    showError('Failed to analyze. Please try again.');
  } finally {
    showLoading(false);
  }
}

function buildPrompt(text, mood) {
  let prompt = `You are a compassionate AI mood analyst. Analyze the following mood journal entry and provide:

1. **Emotional Insight**: A brief, empathetic understanding of the emotions expressed
2. **Pattern Recognition**: Any underlying themes or patterns you notice
3. **Gentle Suggestion**: One supportive suggestion or affirmation

Keep your response warm, concise (under 100 words), and non-judgmental. Use simple formatting.

`;

  if (mood) {
    prompt += `Selected mood: ${mood.emoji} ${mood.mood}\n`;
  }

  if (text) {
    prompt += `Journal entry: "${text}"`;
  } else {
    prompt += `(User selected their mood but didn't write anything - provide a brief insight based on the mood selection alone)`;
  }

  return prompt;
}

function displayAnalysis(content, mood) {
  // Format the content with some basic HTML
  const formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  analysisContent.innerHTML = formattedContent;
  detectedMoodText.textContent = mood?.mood || 'Mixed emotions';
  analysisTime.textContent = formatTime(new Date());

  analysisResult.classList.remove('hidden');
  
  // Smooth scroll to result
  analysisResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ===== HISTORY MANAGEMENT =====
function loadHistory() {
  const history = getHistory();
  renderHistory(history);
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  
  // Keep only last N entries
  const trimmed = history.slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  
  renderHistory(trimmed);
}

function renderHistory(history) {
  if (!history.length) {
    moodHistory.innerHTML = '<p class="empty-state">No entries yet. Start journaling!</p>';
    return;
  }

  moodHistory.innerHTML = history.map(entry => `
    <div class="history-item">
      <span class="history-emoji">${entry.emoji}</span>
      <div class="history-content">
        <p class="history-text">${escapeHtml(entry.text)}</p>
        <span class="history-time">${formatTimeAgo(entry.timestamp)}</span>
      </div>
    </div>
  `).join('');
}

function setupClearHistory() {
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all mood history?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderHistory([]);
      analysisResult.classList.add('hidden');
    }
  });
}

// ===== UTILITIES =====
function showLoading(show) {
  loadingOverlay.classList.toggle('hidden', !show);
  analyzeBtn.disabled = show;
}

function showError(message) {
  // Simple alert for now - could be enhanced with a toast
  alert(message);
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return new Date(timestamp).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
