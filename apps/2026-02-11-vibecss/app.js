// ========================================
// VibeCSS — Vibe Coding for CSS
// ========================================

const vibeInput = document.getElementById('vibeInput');
const cssTarget = document.getElementById('cssTarget');
const cssFramework = document.getElementById('cssFramework');
const generateBtn = document.getElementById('generateBtn');
const outputSection = document.getElementById('outputSection');
const codeOutput = document.getElementById('codeOutput').querySelector('code');
const copyBtn = document.getElementById('copyBtn');
const livePreview = document.getElementById('livePreview');
const exampleChips = document.querySelectorAll('.example-chip');

// Generate CSS via AI
async function generateCSS() {
  const vibe = vibeInput.value.trim();
  if (!vibe) {
    shakeElement(vibeInput);
    return;
  }

  const target = cssTarget.value;
  const format = cssFramework.value;

  // Set loading state
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<i class="ph-light ph-circle-notch"></i> Generating...';
  generateBtn.querySelector('i').style.animation = 'spin 1s linear infinite';

  const systemPrompt = `You are an expert CSS designer. Generate clean, production-ready CSS based on the user's vibe description.

Rules:
- Generate ONLY the CSS code, no explanations
- Match the mood/feeling described exactly
- Use modern CSS features (gradients, shadows, backdrop-filter, etc.)
- Include hover states when appropriate
- Use semantic property ordering
- Add brief comments for sections

Target: ${target}
Format: ${format === 'vanilla' ? 'Standard CSS' : format === 'tailwind' ? 'Tailwind CSS classes' : 'CSS Custom Properties (variables)'}

For cards: include .card class with padding, border, background, shadows, border-radius
For buttons: include .btn class with all states (normal, hover, active, focus)
For hero: include .hero class with layout, typography, and background effects
For full page: include body, headings, links, and utility classes`;

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create CSS for this vibe: "${vibe}"` }
        ],
        model: 'gpt-4o-mini',
        max_tokens: 1000
      })
    });

    const data = await response.json();
    let css = data.content || data.choices?.[0]?.message?.content || '';

    // Clean up response (remove markdown code blocks if present)
    css = css.replace(/```css\n?/g, '').replace(/```\n?/g, '').trim();

    // Display the CSS
    displayCSS(css, target);

  } catch (error) {
    console.error('API Error:', error);
    codeOutput.textContent = `/* Error generating CSS. Please try again. */\n\n/* Fallback vibe-inspired styles */\n${getFallbackCSS(vibe, target)}`;
    outputSection.style.display = 'block';
    renderPreview(getFallbackCSS(vibe, target), target);
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="ph-light ph-magic-wand"></i> Generate CSS';
  }
}

// Display generated CSS
function displayCSS(css, target) {
  codeOutput.textContent = css;
  outputSection.style.display = 'block';
  outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderPreview(css, target);
}

// Render live preview
function renderPreview(css, target) {
  let previewHTML = '';
  let className = '';

  switch (target) {
    case 'card':
      className = 'card';
      previewHTML = `
        <div class="preview-card">
          <h4>Card Title</h4>
          <p>This is a preview of your vibe-coded card component.</p>
        </div>
      `;
      break;
    case 'button':
      className = 'btn';
      previewHTML = `
        <div class="preview-buttons">
          <button class="preview-btn">Click Me</button>
          <button class="preview-btn secondary">Secondary</button>
        </div>
      `;
      break;
    case 'hero':
      className = 'hero';
      previewHTML = `
        <div class="preview-hero">
          <h2>Hero Section</h2>
          <p>Your vibe, visualized.</p>
          <button>Get Started</button>
        </div>
      `;
      break;
    case 'page':
      className = 'page';
      previewHTML = `
        <div class="preview-page">
          <h3>Page Preview</h3>
          <p>Full page vibe styling in action.</p>
          <a href="#">Sample Link</a>
        </div>
      `;
      break;
  }

  // Create scoped preview with injected styles
  const scopedCSS = scopeCSS(css, '.live-preview');
  
  livePreview.innerHTML = `
    <style>${scopedCSS}</style>
    ${previewHTML}
  `;
}

// Scope CSS to preview container
function scopeCSS(css, scope) {
  // Simple scoping: prepend scope to each selector
  return css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, suffix) => {
    // Skip @rules and comments
    if (selector.trim().startsWith('@') || selector.trim().startsWith('/*')) {
      return match;
    }
    // Skip :root
    if (selector.trim() === ':root') {
      return match;
    }
    return `${scope} ${selector.trim()}${suffix}`;
  });
}

// Fallback CSS generator (when API fails)
function getFallbackCSS(vibe, target) {
  const vibeLower = vibe.toLowerCase();
  let primaryColor = '#3B82F6';
  let secondaryColor = '#8B5CF6';
  let bgColor = '#0f0f12';

  // Simple vibe detection
  if (vibeLower.includes('pink') || vibeLower.includes('cyber')) {
    primaryColor = '#ec4899';
    secondaryColor = '#06b6d4';
  } else if (vibeLower.includes('green') || vibeLower.includes('nature') || vibeLower.includes('zen')) {
    primaryColor = '#10b981';
    secondaryColor = '#6b7280';
    bgColor = '#0a1210';
  } else if (vibeLower.includes('gold') || vibeLower.includes('luxury')) {
    primaryColor = '#f59e0b';
    secondaryColor = '#1f1f23';
  } else if (vibeLower.includes('retro') || vibeLower.includes('arcade')) {
    primaryColor = '#ef4444';
    secondaryColor = '#eab308';
  }

  return `/* ${vibe} */
.${target === 'page' ? 'body' : target === 'hero' ? 'hero' : target === 'button' ? 'btn' : 'card'} {
  background: ${bgColor};
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid ${primaryColor}33;
  box-shadow: 0 8px 32px ${primaryColor}22;
}`;
}

// Copy to clipboard
async function copyToClipboard() {
  const css = codeOutput.textContent;
  
  try {
    await navigator.clipboard.writeText(css);
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<i class="ph-light ph-check"></i> Copied!';
    
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = '<i class="ph-light ph-copy"></i> Copy';
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

// Shake animation for validation
function shakeElement(el) {
  el.style.animation = 'shake 0.5s ease-in-out';
  el.addEventListener('animationend', () => {
    el.style.animation = '';
  }, { once: true });
}

// Add shake keyframes dynamically
const shakeKeyframes = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${shakeKeyframes}</style>`);

// Event Listeners
generateBtn.addEventListener('click', generateCSS);

vibeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.metaKey) {
    generateCSS();
  }
});

copyBtn.addEventListener('click', copyToClipboard);

exampleChips.forEach(chip => {
  chip.addEventListener('click', () => {
    vibeInput.value = chip.dataset.vibe;
    vibeInput.focus();
    // Optional: auto-generate
    // generateCSS();
  });
});

// Initial focus
vibeInput.focus();
