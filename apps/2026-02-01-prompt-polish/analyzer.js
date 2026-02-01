/**
 * Prompt Polish - Prompt Analyzer
 * Analyzes prompts using heuristics and provides improvement suggestions
 */

// DOM Elements
const promptInput = document.getElementById('prompt-input');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsSection = document.getElementById('results');
const scoreEl = document.getElementById('score');
const scoreTitleEl = document.getElementById('score-title');
const scoreDescEl = document.getElementById('score-description');
const suggestionsListEl = document.getElementById('suggestions-list');
const improvedSection = document.getElementById('improved-section');
const improvedPromptEl = document.getElementById('improved-prompt');
const copyBtn = document.getElementById('copy-btn');

// Analysis categories
const categories = ['clarity', 'specificity', 'structure', 'context'];

// Vague words that indicate lack of specificity
const vagueWords = [
    'something', 'stuff', 'thing', 'things', 'good', 'nice', 'better', 
    'some', 'maybe', 'probably', 'kind of', 'sort of', 'like', 'whatever',
    'etc', 'and so on', 'you know', 'basically'
];

// Action words that indicate clear intent
const actionWords = [
    'create', 'write', 'generate', 'build', 'design', 'implement', 'develop',
    'explain', 'analyze', 'summarize', 'compare', 'list', 'describe', 'outline',
    'convert', 'translate', 'fix', 'debug', 'optimize', 'refactor', 'review'
];

// Context indicators
const contextIndicators = [
    'using', 'with', 'in', 'for', 'because', 'so that', 'which', 'where',
    'when', 'how', 'why', 'target', 'audience', 'purpose', 'goal'
];

// Structure indicators
const structureIndicators = [
    '1.', '2.', '3.', '-', '•', '*', 'first', 'second', 'then', 'finally',
    'step', 'requirement', 'constraint', 'format', 'example', 'output'
];

/**
 * Main analysis function
 * @param {string} prompt - The prompt to analyze
 * @returns {Object} Analysis results
 */
function analyzePrompt(prompt) {
    const trimmed = prompt.trim();
    
    if (!trimmed) {
        return null;
    }

    const words = trimmed.toLowerCase().split(/\s+/);
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim());
    
    // Calculate individual scores
    const clarity = calculateClarity(trimmed, words, sentences);
    const specificity = calculateSpecificity(trimmed, words);
    const structure = calculateStructure(trimmed, words);
    const context = calculateContext(trimmed, words);
    
    // Overall score (weighted average)
    const overallScore = Math.round(
        (clarity.score * 0.25) + 
        (specificity.score * 0.30) + 
        (structure.score * 0.20) + 
        (context.score * 0.25)
    );
    
    // Generate suggestions
    const suggestions = generateSuggestions(trimmed, clarity, specificity, structure, context);
    
    // Generate improved version if score is low
    const improvedPrompt = overallScore < 70 ? generateImprovedPrompt(trimmed, suggestions) : null;
    
    return {
        overall: overallScore,
        clarity,
        specificity,
        structure,
        context,
        suggestions,
        improvedPrompt
    };
}

/**
 * Calculate clarity score
 */
function calculateClarity(prompt, words, sentences) {
    let score = 50; // Base score
    const issues = [];
    
    // Length check
    if (words.length < 5) {
        score -= 20;
        issues.push('Too short - provide more detail');
    } else if (words.length > 10 && words.length <= 30) {
        score += 20;
    } else if (words.length > 30 && words.length <= 100) {
        score += 30;
    } else if (words.length > 100) {
        score += 20; // Long is good but might be verbose
    }
    
    // Check for action verbs at start
    const firstWord = words[0];
    if (actionWords.some(a => firstWord.includes(a))) {
        score += 20;
    } else {
        issues.push('Start with an action verb (create, write, explain...)');
    }
    
    // Check for question marks (questions are clear)
    if (prompt.includes('?')) {
        score += 10;
    }
    
    // Penalize all caps
    if (prompt === prompt.toUpperCase() && prompt.length > 10) {
        score -= 10;
        issues.push('Avoid ALL CAPS - it reduces readability');
    }
    
    return {
        score: clamp(score, 0, 100),
        detail: issues.length > 0 ? issues[0] : 'Clear and well-formed prompt'
    };
}

/**
 * Calculate specificity score
 */
function calculateSpecificity(prompt, words) {
    let score = 50;
    const issues = [];
    
    // Check for vague words
    const vagueCount = words.filter(w => vagueWords.includes(w)).length;
    if (vagueCount > 0) {
        score -= vagueCount * 10;
        issues.push(`Avoid vague terms (found: ${vagueCount})`);
    }
    
    // Check for numbers/quantities (specific)
    if (/\d+/.test(prompt)) {
        score += 15;
    }
    
    // Check for quoted examples
    if (prompt.includes('"') || prompt.includes("'") || prompt.includes('`')) {
        score += 15;
    }
    
    // Check for specific technologies/tools mentioned
    const techPatterns = /\b(python|javascript|react|api|json|html|css|sql|typescript|node|docker|aws|azure)\b/i;
    if (techPatterns.test(prompt)) {
        score += 20;
    }
    
    // Check for format specifications
    if (/\b(format|output|return|give me|provide)\b/i.test(prompt)) {
        score += 10;
    }
    
    // Longer prompts tend to be more specific
    if (words.length > 20) {
        score += 10;
    }
    
    return {
        score: clamp(score, 0, 100),
        detail: issues.length > 0 ? issues[0] : 'Good level of specificity'
    };
}

/**
 * Calculate structure score
 */
function calculateStructure(prompt, words) {
    let score = 40;
    const issues = [];
    
    // Check for list/numbered items
    const hasLists = structureIndicators.some(s => prompt.includes(s));
    if (hasLists) {
        score += 30;
    }
    
    // Check for line breaks (structured prompt)
    if (prompt.includes('\n')) {
        score += 20;
    }
    
    // Check for section headers (e.g., "Context:", "Requirements:")
    if (/[A-Z][a-z]+:/g.test(prompt)) {
        score += 20;
    }
    
    // Single sentence is less structured
    if (!prompt.includes('.') && !prompt.includes('\n') && words.length < 20) {
        score -= 10;
        issues.push('Consider breaking into multiple points');
    }
    
    // Check for examples
    if (/\b(example|e\.g\.|for instance|such as)\b/i.test(prompt)) {
        score += 15;
    }
    
    return {
        score: clamp(score, 0, 100),
        detail: issues.length > 0 ? issues[0] : 'Well-structured prompt'
    };
}

/**
 * Calculate context score
 */
function calculateContext(prompt, words) {
    let score = 40;
    const issues = [];
    
    // Check for context indicators
    const contextCount = contextIndicators.filter(c => 
        prompt.toLowerCase().includes(c)
    ).length;
    
    if (contextCount > 0) {
        score += contextCount * 8;
    } else {
        issues.push('Add context (who, what, why, how)');
    }
    
    // Check for role/persona setting
    if (/\b(as a|act as|you are|pretend|role)\b/i.test(prompt)) {
        score += 15;
    }
    
    // Check for constraints/requirements
    if (/\b(must|should|need to|require|constraint|limit)\b/i.test(prompt)) {
        score += 10;
    }
    
    // Check for audience specification
    if (/\b(for|audience|user|reader|beginner|expert|developer)\b/i.test(prompt)) {
        score += 10;
    }
    
    return {
        score: clamp(score, 0, 100),
        detail: issues.length > 0 ? issues[0] : 'Good contextual information'
    };
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(prompt, clarity, specificity, structure, context) {
    const suggestions = [];
    const words = prompt.toLowerCase().split(/\s+/);
    
    // Always start with what's good
    if (clarity.score >= 70) {
        suggestions.push({ text: '✓ Clear and direct language', good: true });
    }
    
    // Clarity suggestions
    if (clarity.score < 70) {
        if (!actionWords.some(a => words[0]?.includes(a))) {
            suggestions.push({ 
                text: 'Start with an action verb like "Create", "Write", "Explain", or "Generate"', 
                good: false 
            });
        }
    }
    
    // Specificity suggestions
    if (specificity.score < 70) {
        const vagueFound = vagueWords.filter(v => prompt.toLowerCase().includes(v));
        if (vagueFound.length > 0) {
            suggestions.push({ 
                text: `Replace vague terms like "${vagueFound[0]}" with specific descriptions`, 
                good: false 
            });
        }
        
        if (!/\d+/.test(prompt)) {
            suggestions.push({ 
                text: 'Add specific numbers or quantities (e.g., "5 examples", "in 200 words")', 
                good: false 
            });
        }
    }
    
    // Structure suggestions  
    if (structure.score < 70) {
        if (!prompt.includes('\n') && words.length > 15) {
            suggestions.push({ 
                text: 'Break your prompt into sections with line breaks or bullet points', 
                good: false 
            });
        }
        
        if (!/\b(example|e\.g\.)\b/i.test(prompt)) {
            suggestions.push({ 
                text: 'Include an example of what you want the output to look like', 
                good: false 
            });
        }
    }
    
    // Context suggestions
    if (context.score < 70) {
        if (!/\b(for|audience|user)\b/i.test(prompt)) {
            suggestions.push({ 
                text: 'Specify who the output is for (e.g., "for beginners", "for a technical audience")', 
                good: false 
            });
        }
        
        if (!/\b(because|so that|purpose|goal)\b/i.test(prompt)) {
            suggestions.push({ 
                text: 'Add the purpose or goal of your request', 
                good: false 
            });
        }
    }
    
    // If everything is good
    if (suggestions.length === 0 || suggestions.every(s => s.good)) {
        suggestions.push({ text: '✓ Great prompt! Ready to use.', good: true });
    }
    
    return suggestions;
}

/**
 * Generate an improved version of the prompt
 */
function generateImprovedPrompt(original, suggestions) {
    // This is a simplified improvement - in a real app, you might use an LLM
    let improved = original.trim();
    const words = improved.split(/\s+/);
    
    // Add action verb if missing
    if (!actionWords.some(a => words[0]?.toLowerCase().includes(a))) {
        // Determine likely intent
        if (/code|function|script|program/i.test(improved)) {
            improved = 'Write ' + improved;
        } else if (/explain|what|how|why/i.test(improved)) {
            improved = 'Explain ' + improved;
        } else {
            improved = 'Create ' + improved;
        }
    }
    
    // Add structure if it's a long single sentence
    if (!improved.includes('\n') && words.length > 20) {
        improved = improved + '\n\nRequirements:\n- Be specific\n- Provide examples';
    }
    
    // Add context hint if missing
    if (!/\b(for|audience|purpose)\b/i.test(improved)) {
        improved = improved + '\n\nContext: [Add your target audience and purpose here]';
    }
    
    return improved;
}

/**
 * Utility: Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Get score level (good/medium/poor)
 */
function getScoreLevel(score) {
    if (score >= 70) return 'good';
    if (score >= 40) return 'medium';
    return 'poor';
}

/**
 * Get score description
 */
function getScoreDescription(score) {
    if (score >= 90) return 'Excellent! This prompt is well-crafted and specific.';
    if (score >= 70) return 'Good prompt! Minor improvements possible.';
    if (score >= 50) return 'Decent start, but could use more detail.';
    if (score >= 30) return 'Needs work. Add more specificity and context.';
    return 'Very vague. Consider completely rewriting with more detail.';
}

/**
 * Update the UI with analysis results
 */
function updateUI(results) {
    if (!results) {
        resultsSection.classList.add('hidden');
        return;
    }
    
    resultsSection.classList.remove('hidden');
    
    // Update score circle with animation
    const scorePercent = results.overall;
    scoreEl.textContent = scorePercent;
    scoreTitleEl.textContent = scorePercent >= 70 ? 'Great Prompt!' : scorePercent >= 40 ? 'Needs Improvement' : 'Weak Prompt';
    scoreDescEl.textContent = getScoreDescription(scorePercent);
    
    // Animate score circle
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.background = `conic-gradient(var(--${getScoreLevel(scorePercent) === 'good' ? 'secondary' : getScoreLevel(scorePercent) === 'medium' ? 'warning' : 'danger'}) ${scorePercent}%, var(--bg-input) ${scorePercent}%)`;
    
    // Update category cards
    categories.forEach(cat => {
        const data = results[cat];
        const progress = document.getElementById(`${cat}-progress`);
        const detail = document.getElementById(`${cat}-detail`);
        
        progress.style.width = `${data.score}%`;
        progress.className = `progress ${getScoreLevel(data.score)}`;
        detail.textContent = data.detail;
    });
    
    // Update suggestions
    suggestionsListEl.innerHTML = results.suggestions
        .map(s => `<li class="${s.good ? 'good' : ''}">${s.text}</li>`)
        .join('');
    
    // Show improved prompt if available
    if (results.improvedPrompt) {
        improvedSection.classList.remove('hidden');
        improvedPromptEl.textContent = results.improvedPrompt;
    } else {
        improvedSection.classList.add('hidden');
    }
}

// Event Listeners
promptInput.addEventListener('input', () => {
    charCount.textContent = promptInput.value.length;
});

analyzeBtn.addEventListener('click', () => {
    const prompt = promptInput.value;
    const results = analyzePrompt(prompt);
    updateUI(results);
    
    // Scroll to results
    if (results) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

// Allow Enter + Ctrl/Cmd to analyze
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        analyzeBtn.click();
    }
});

// Copy improved prompt
copyBtn.addEventListener('click', async () => {
    const text = improvedPromptEl.textContent;
    try {
        await navigator.clipboard.writeText(text);
        copyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy to Clipboard';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});

// Initialize
charCount.textContent = '0';
