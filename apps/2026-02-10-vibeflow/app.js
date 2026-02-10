// ===== VibeFlow — Focus Space for Vibe Coding =====

// === State ===
const state = {
  timer: {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    interval: null,
    mode: 25
  },
  sounds: {
    current: null,
    audio: null,
    volume: 0.5
  },
  stats: {
    sessions: parseInt(localStorage.getItem('vf_sessions') || '0'),
    prompts: parseInt(localStorage.getItem('vf_prompts') || '0')
  }
};

// === DOM Elements ===
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Prompt Enhancer
const rawPromptEl = $('#rawPrompt');
const contextEl = $('#context');
const enhanceBtn = $('#enhanceBtn');
const enhancedPromptEl = $('#enhancedPrompt');
const copyBtn = $('#copyBtn');

// Timer
const timerDisplay = $('#timerDisplay');
const timerStart = $('#timerStart');
const timerReset = $('#timerReset');
const modeBtns = $$('.mode-btn');

// Sounds
const soundBtns = $$('.sound-btn');
const volumeSlider = $('#volumeSlider');

// Stats
const sessionsCount = $('#sessionsCount');
const promptsCount = $('#promptsCount');

// === Sound URLs (royalty-free ambient) ===
const soundUrls = {
  rain: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  lofi: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_8bfb6e7e5e.mp3',
  forest: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d484.mp3',
  cafe: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde808.mp3'
};

// === Initialize ===
function init() {
  updateStats();
  
  // Timer controls
  timerStart.addEventListener('click', toggleTimer);
  timerReset.addEventListener('click', resetTimer);
  
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.timer.mode = parseInt(btn.dataset.time);
      resetTimer();
    });
  });
  
  // Sound controls
  soundBtns.forEach(btn => {
    btn.addEventListener('click', () => toggleSound(btn.dataset.sound, btn));
  });
  
  volumeSlider.addEventListener('input', (e) => {
    state.sounds.volume = e.target.value / 100;
    if (state.sounds.audio) {
      state.sounds.audio.volume = state.sounds.volume;
    }
  });
  
  // Prompt enhancer
  enhanceBtn.addEventListener('click', enhancePrompt);
  copyBtn.addEventListener('click', copyEnhanced);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter' && document.activeElement === rawPromptEl) {
      enhancePrompt();
    }
  });
}

// === Timer Functions ===
function updateTimerDisplay() {
  const mins = String(state.timer.minutes).padStart(2, '0');
  const secs = String(state.timer.seconds).padStart(2, '0');
  timerDisplay.textContent = `${mins}:${secs}`;
}

function toggleTimer() {
  if (state.timer.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  state.timer.isRunning = true;
  timerStart.innerHTML = '<i class="ph-light ph-pause"></i>';
  timerStart.classList.add('active');
  
  state.timer.interval = setInterval(() => {
    if (state.timer.seconds === 0) {
      if (state.timer.minutes === 0) {
        // Timer complete
        completeTimer();
        return;
      }
      state.timer.minutes--;
      state.timer.seconds = 59;
    } else {
      state.timer.seconds--;
    }
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  state.timer.isRunning = false;
  timerStart.innerHTML = '<i class="ph-light ph-play"></i>';
  timerStart.classList.remove('active');
  clearInterval(state.timer.interval);
}

function resetTimer() {
  pauseTimer();
  state.timer.minutes = state.timer.mode;
  state.timer.seconds = 0;
  updateTimerDisplay();
}

function completeTimer() {
  pauseTimer();
  state.stats.sessions++;
  localStorage.setItem('vf_sessions', state.stats.sessions);
  updateStats();
  
  // Visual feedback
  timerDisplay.style.color = 'var(--glow-green)';
  setTimeout(() => {
    timerDisplay.style.color = '';
    resetTimer();
  }, 3000);
  
  // Notification if allowed
  if (Notification.permission === 'granted') {
    new Notification('VibeFlow', {
      body: 'Focus session complete! Take a break 🎉',
      icon: '🌊'
    });
  }
}

// === Sound Functions ===
function toggleSound(soundName, btn) {
  // If clicking the same sound, stop it
  if (state.sounds.current === soundName) {
    stopSound();
    btn.classList.remove('active');
    return;
  }
  
  // Stop current sound
  stopSound();
  soundBtns.forEach(b => b.classList.remove('active'));
  
  // Start new sound
  state.sounds.current = soundName;
  btn.classList.add('active');
  
  // Note: In production, you'd host these files or use a proper audio service
  // For demo, we'll use placeholder behavior
  const url = soundUrls[soundName];
  if (url) {
    state.sounds.audio = new Audio(url);
    state.sounds.audio.loop = true;
    state.sounds.audio.volume = state.sounds.volume;
    state.sounds.audio.play().catch(() => {
      // Audio autoplay blocked, that's ok
      console.log('Audio autoplay blocked by browser');
    });
  }
}

function stopSound() {
  if (state.sounds.audio) {
    state.sounds.audio.pause();
    state.sounds.audio = null;
  }
  state.sounds.current = null;
}

// === Prompt Enhancer ===
async function enhancePrompt() {
  const rawPrompt = rawPromptEl.value.trim();
  if (!rawPrompt) {
    rawPromptEl.focus();
    return;
  }
  
  const context = contextEl.value.trim();
  
  // Loading state
  enhanceBtn.disabled = true;
  enhanceBtn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';
  enhancedPromptEl.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  enhancedPromptEl.classList.add('loading');
  copyBtn.style.display = 'none';
  
  const systemPrompt = `You are a prompt engineering expert for AI coding assistants. Transform the user's rough prompt into a clear, detailed, effective prompt that will get better results from AI coding tools.

Guidelines:
- Be specific about the expected output format
- Include relevant technical context
- Break down complex tasks into steps
- Add constraints and edge cases to consider
- Keep it concise but comprehensive

${context ? `Technical context: ${context}` : ''}

Return ONLY the enhanced prompt, no explanations.`;

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawPrompt }
        ],
        model: 'gpt-4o-mini',
        max_tokens: 800
      })
    });
    
    if (!res.ok) throw new Error('API error');
    
    const data = await res.json();
    const enhanced = data.content || data.choices?.[0]?.message?.content || 'Error processing response';
    
    enhancedPromptEl.textContent = enhanced;
    enhancedPromptEl.classList.remove('loading');
    copyBtn.style.display = 'inline-flex';
    
    // Update stats
    state.stats.prompts++;
    localStorage.setItem('vf_prompts', state.stats.prompts);
    updateStats();
    
  } catch (err) {
    console.error('Enhance error:', err);
    enhancedPromptEl.textContent = '⚠️ Could not enhance prompt. Please try again.';
    enhancedPromptEl.classList.remove('loading');
  } finally {
    enhanceBtn.disabled = false;
    enhanceBtn.innerHTML = '<i class="ph-light ph-sparkle"></i><span>Enhance with AI</span>';
  }
}

function copyEnhanced() {
  const text = enhancedPromptEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.innerHTML = '<i class="ph-light ph-check"></i> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="ph-light ph-copy"></i> Copy';
    }, 2000);
  });
}

// === Stats ===
function updateStats() {
  sessionsCount.textContent = state.stats.sessions;
  promptsCount.textContent = state.stats.prompts;
}

// === Start ===
document.addEventListener('DOMContentLoaded', init);

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
