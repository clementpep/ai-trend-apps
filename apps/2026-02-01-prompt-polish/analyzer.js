/**
 * Prompt Polish - AI-Powered Prompt Analyzer
 * Uses GPT-4o-mini for expert analysis with heuristic fallback
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

// =============================================================================
// AI-POWERED ANALYSIS (Primary)
// =============================================================================

/**
 * Expert system prompt for prompt analysis
 * Uses advanced prompting techniques: persona, chain of thought, structured output
 */
const EXPERT_SYSTEM_PROMPT = `You are an elite Prompt Engineer with 10+ years of experience crafting prompts for large language models. You've worked at OpenAI, Anthropic, and Google DeepMind.

Your expertise includes:
- Prompt optimization for clarity, specificity, and effectiveness
- Chain-of-thought prompting techniques
- Few-shot learning optimization
- Output formatting and structure
- Context engineering and persona design

TASK: Analyze the user's prompt and provide expert feedback.

ANALYSIS PROCESS (think step by step):
1. First, identify the user's apparent intent
2. Evaluate clarity: Is the goal unambiguous? Are there vague terms?
3. Evaluate specificity: Are requirements precise? Are constraints defined?
4. Evaluate structure: Is it well-organized? Does it guide the AI logically?
5. Evaluate context: Is there enough background? Is the persona/audience clear?
6. Identify the top 3-5 improvements that would have the most impact
7. Rewrite the prompt applying all best practices

OUTPUT FORMAT (respond in valid JSON only, no markdown):
{
  "scores": {
    "clarity": <0-100>,
    "specificity": <0-100>,
    "structure": <0-100>,
    "context": <0-100>,
    "overall": <0-100>
  },
  "analysis": {
    "intent": "<what the user wants to achieve>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"]
  },
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>"
  ],
  "improvedPrompt": "<the rewritten, optimized version of the prompt>"
}`;

/**
 * Call the AI API for expert analysis
 * @param {string} prompt - The prompt to analyze
 * @returns {Promise<Object|null>} Analysis results or null if failed
 */
async function analyzeWithAI(prompt) {
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: EXPERT_SYSTEM_PROMPT },
                    { role: 'user', content: `Analyze this prompt:\n\n"${prompt}"` }
                ],
                model: 'gpt-4o-mini',
                max_tokens: 800
            })
        });

        if (!response.ok) {
            console.warn('AI API failed, falling back to heuristics');
            return null;
        }

        const data = await response.json();
        
        if (!data.content) {
            return null;
        }

        // Parse JSON response (handle potential markdown code blocks)
        let jsonStr = data.content.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
        }

        const analysis = JSON.parse(jsonStr);
        
        return {
            overall: analysis.scores.overall,
            clarity: { score: analysis.scores.clarity, detail: '' },
            specificity: { score: analysis.scores.specificity, detail: '' },
            structure: { score: analysis.scores.structure, detail: '' },
            context: { score: analysis.scores.context, detail: '' },
            suggestions: analysis.suggestions,
            improvedPrompt: analysis.improvedPrompt,
            analysis: analysis.analysis,
            aiPowered: true
        };
    } catch (error) {
        console.warn('AI analysis failed:', error);
        return null;
    }
}

// =============================================================================
// HEURISTIC ANALYSIS (Fallback)
// =============================================================================

const vagueWords = [
    'something', 'stuff', 'thing', 'things', 'good', 'nice', 'better', 
    'some', 'maybe', 'probably', 'kind of', 'sort of', 'like', 'whatever',
    'etc', 'and so on', 'you know', 'basically'
];

const actionWords = [
    'create', 'write', 'generate', 'build', 'design', 'implement', 'develop',
    'explain', 'analyze', 'summarize', 'compare', 'list', 'describe', 'outline',
    'convert', 'translate', 'fix', 'debug', 'optimize', 'refactor', 'review'
];

const contextIndicators = [
    'using', 'with', 'in', 'for', 'because', 'so that', 'which', 'where',
    'when', 'how', 'why', 'target', 'audience', 'purpose', 'goal'
];

const structureIndicators = [
    '1.', '2.', '3.', '-', '•', '*', 'first', 'second', 'then', 'finally',
    'step', 'requirement', 'constraint', 'format', 'example', 'output'
];

function analyzeWithHeuristics(prompt) {
    const trimmed = prompt.trim();
    if (!trimmed) return null;

    const words = trimmed.toLowerCase().split(/\\s+/);
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim());
    
    const clarity = calculateClarity(trimmed, words, sentences);
    const specificity = calculateSpecificity(trimmed, words);
    const structure = calculateStructure(trimmed, words);
    const context = calculateContext(trimmed, words);
    
    const overallScore = Math.round(
        (clarity.score * 0.25) + 
        (specificity.score * 0.30) + 
        (structure.score * 0.20) + 
        (context.score * 0.25)
    );
    
    const suggestions = generateSuggestions(trimmed, clarity, specificity, structure, context);
    const improvedPrompt = overallScore < 70 ? generateImprovedPrompt(trimmed, suggestions) : null;
    
    return {
        overall: overallScore,
        clarity,
        specificity,
        structure,
        context,
        suggestions,
        improvedPrompt,
        aiPowered: false
    };
}

function calculateClarity(prompt, words, sentences) {
    let score = 50;
    const issues = [];
    
    // Check for action words
    const hasActionWord = actionWords.some(word => words.includes(word));
    if (hasActionWord) {
        score += 20;
    } else {
        issues.push('No clear action verb');
    }
    
    // Check prompt length
    if (words.length < 5) {
        score -= 20;
        issues.push('Too short');
    } else if (words.length >= 10 && words.length <= 50) {
        score += 15;
    } else if (words.length > 100) {
        score -= 10;
        issues.push('Very long');
    }
    
    // Check for questions
    if (prompt.includes('?') && sentences.length <= 2) {
        score += 10;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    return {
        score,
        detail: issues.length > 0 ? issues.join(', ') : 'Clear intent detected'
    };
}

function calculateSpecificity(prompt, words) {
    let score = 50;
    const issues = [];
    
    // Check for vague words
    const vagueCount = vagueWords.filter(word => 
        prompt.toLowerCase().includes(word)
    ).length;
    
    if (vagueCount === 0) {
        score += 20;
    } else {
        score -= vagueCount * 10;
        issues.push(`${vagueCount} vague term(s)`);
    }
    
    // Check for numbers/specifics
    const hasNumbers = /\\d+/.test(prompt);
    if (hasNumbers) {
        score += 15;
    }
    
    // Check for quotes (examples)
    const hasExamples = prompt.includes('"') || prompt.includes("'") || prompt.includes('`');
    if (hasExamples) {
        score += 15;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    return {
        score,
        detail: issues.length > 0 ? issues.join(', ') : 'Good specificity'
    };
}

function calculateStructure(prompt, words) {
    let score = 40;
    const issues = [];
    
    // Check for structure indicators
    const structureCount = structureIndicators.filter(indicator => 
        prompt.toLowerCase().includes(indicator.toLowerCase())
    ).length;
    
    if (structureCount >= 3) {
        score += 40;
    } else if (structureCount >= 1) {
        score += 20;
    } else {
        issues.push('No structural elements');
    }
    
    // Check for line breaks
    const lineBreaks = (prompt.match(/\\n/g) || []).length;
    if (lineBreaks >= 2) {
        score += 20;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    return {
        score,
        detail: issues.length > 0 ? issues.join(', ') : 'Well structured'
    };
}

function calculateContext(prompt, words) {
    let score = 40;
    const issues = [];
    
    // Check for context indicators
    const contextCount = contextIndicators.filter(indicator => 
        words.includes(indicator)
    ).length;
    
    if (contextCount >= 3) {
        score += 40;
    } else if (contextCount >= 1) {
        score += 20;
    } else {
        issues.push('Limited context');
    }
    
    // Check for role/persona
    const hasPersona = /you are|act as|pretend|imagine|as a/i.test(prompt);
    if (hasPersona) {
        score += 20;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    return {
        score,
        detail: issues.length > 0 ? issues.join(', ') : 'Good context'
    };
}

function generateSuggestions(prompt, clarity, specificity, structure, context) {
    const suggestions = [];
    
    if (clarity.score < 60) {
        suggestions.push('Start with a clear action verb (create, write, explain, analyze...)');
    }
    
    if (specificity.score < 60) {
        suggestions.push('Replace vague words with specific requirements');
        suggestions.push('Add concrete examples or expected output format');
    }
    
    if (structure.score < 60) {
        suggestions.push('Use numbered lists or bullet points for multiple requirements');
        suggestions.push('Separate context, task, and output format into distinct sections');
    }
    
    if (context.score < 60) {
        suggestions.push('Add context: who is the audience? what is the purpose?');
        suggestions.push('Consider adding a persona or role for the AI');
    }
    
    if (suggestions.length === 0) {
        suggestions.push('Your prompt is well-crafted! Consider A/B testing variations.');
    }
    
    return suggestions.slice(0, 5);
}

function generateImprovedPrompt(original, suggestions) {
    let improved = original;
    
    // Add action verb if missing
    if (!actionWords.some(word => original.toLowerCase().includes(word))) {
        improved = 'Please ' + improved.charAt(0).toLowerCase() + improved.slice(1);
    }
    
    // Add structure hint
    if (!improved.includes('\\n') && improved.length > 50) {
        improved += '\\n\\nPlease structure your response clearly.';
    }
    
    return improved;
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Main analysis function - tries AI first, falls back to heuristics
 */
async function analyzePrompt(prompt) {
    const trimmed = prompt.trim();
    if (!trimmed) return null;
    
    // Try AI analysis first
    const aiResult = await analyzeWithAI(trimmed);
    if (aiResult) {
        return aiResult;
    }
    
    // Fallback to heuristics
    return analyzeWithHeuristics(trimmed);
}

// =============================================================================
// UI HANDLERS
// =============================================================================

promptInput.addEventListener('input', () => {
    charCount.textContent = promptInput.value.length;
});

analyzeBtn.addEventListener('click', async () => {
    const prompt = promptInput.value;
    
    if (!prompt.trim()) {
        alert('Please enter a prompt to analyze');
        return;
    }
    
    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="btn-icon">⏳</span> Analyzing...';
    
    try {
        const results = await analyzePrompt(prompt);
        
        if (!results) {
            alert('Could not analyze the prompt');
            return;
        }
        
        displayResults(results);
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed. Please try again.');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span> Analyze Prompt';
    }
});

function displayResults(results) {
    resultsSection.classList.remove('hidden');
    
    // Update overall score
    scoreEl.textContent = results.overall;
    
    // Score description based on value
    if (results.overall >= 80) {
        scoreTitleEl.textContent = '🌟 Excellent!';
        scoreDescEl.textContent = results.aiPowered ? 'AI-verified high-quality prompt' : 'High-quality prompt detected';
    } else if (results.overall >= 60) {
        scoreTitleEl.textContent = '👍 Good';
        scoreDescEl.textContent = 'Solid prompt with room for improvement';
    } else if (results.overall >= 40) {
        scoreTitleEl.textContent = '⚡ Needs Work';
        scoreDescEl.textContent = 'Several areas need improvement';
    } else {
        scoreTitleEl.textContent = '🔧 Needs Revision';
        scoreDescEl.textContent = 'Significant improvements recommended';
    }
    
    // Add AI badge if applicable
    if (results.aiPowered) {
        scoreDescEl.innerHTML += ' <span style="background: linear-gradient(135deg, #6366f1, #10b981); padding: 2px 8px; border-radius: 100px; font-size: 0.7rem; margin-left: 8px;">🤖 AI Analysis</span>';
    }
    
    // Update category scores
    categories.forEach(cat => {
        const progress = document.getElementById(`${cat}-progress`);
        const detail = document.getElementById(`${cat}-detail`);
        const score = results[cat].score;
        
        progress.style.width = `${score}%`;
        progress.style.background = score >= 70 ? 'var(--secondary)' : 
                                    score >= 40 ? 'var(--warning)' : 'var(--danger)';
        
        detail.textContent = results[cat].detail || `Score: ${score}/100`;
    });
    
    // Show AI analysis insights if available
    if (results.analysis) {
        const intentText = results.analysis.intent ? 
            `<div style="margin-bottom: 12px; padding: 12px; background: rgba(99, 102, 241, 0.1); border-radius: 8px;">
                <strong>🎯 Detected Intent:</strong> ${results.analysis.intent}
            </div>` : '';
        suggestionsListEl.innerHTML = intentText;
    } else {
        suggestionsListEl.innerHTML = '';
    }
    
    // Display suggestions
    results.suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        suggestionsListEl.appendChild(li);
    });
    
    // Show improved prompt if available
    if (results.improvedPrompt) {
        improvedSection.classList.remove('hidden');
        improvedPromptEl.textContent = results.improvedPrompt;
    } else {
        improvedSection.classList.add('hidden');
    }
    
    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

copyBtn.addEventListener('click', () => {
    const text = improvedPromptEl.textContent;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy to Clipboard';
        }, 2000);
    });
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        analyzeBtn.click();
    }
});
