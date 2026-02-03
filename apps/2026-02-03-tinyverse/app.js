// TinyVerse - Interactive World Generator
// Uses AI to parse descriptions and create animated scenes

const generateBtn = document.getElementById('generate-btn');
const descriptionInput = document.getElementById('world-description');
const worldContainer = document.getElementById('world-container');
const worldElements = document.getElementById('world-elements');
const worldInfo = document.getElementById('world-info');
const worldCanvas = document.getElementById('world-canvas');
const placeholder = document.querySelector('.world-placeholder');
const exampleBtns = document.querySelectorAll('.example-btn');

// Canvas setup
const ctx = worldCanvas.getContext('2d');
let particles = [];
let animationId = null;

// Resize canvas
function resizeCanvas() {
    worldCanvas.width = worldContainer.offsetWidth;
    worldCanvas.height = worldContainer.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// AI API call
async function askAI(userMessage) {
    const systemPrompt = `You are a creative world designer. Given a scene description, return a JSON object with:
- "title": A poetic 2-4 word name for this world
- "mood": One word describing the atmosphere (peaceful, mysterious, magical, futuristic, cozy, wild)
- "colors": Array of 3 hex colors for the scene gradient background (dark to light)
- "elements": Array of 8-15 objects with:
  - "emoji": Single emoji representing the element
  - "x": Horizontal position 5-95 (percentage)
  - "y": Vertical position 5-85 (percentage)
  - "size": Size multiplier 0.5-2.5
  - "animation": One of "float", "pulse", "spin", "twinkle", or "none"
  - "layer": 1-3 (1=background, 2=middle, 3=foreground)
- "particles": Object with "type" (stars, snow, rain, fireflies, dust, bubbles, none) and "color" (hex)
- "description": A one-sentence poetic description of the world

Be creative with emoji choices and compositions. Create depth with layers.
Return ONLY valid JSON, no markdown.`;

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                model: 'gpt-4o-mini',
                max_tokens: 800
            })
        });
        
        const data = await response.json();
        return JSON.parse(data.content);
    } catch (error) {
        console.error('AI Error:', error);
        // Fallback to local generation
        return generateLocalWorld(userMessage);
    }
}

// Fallback local world generator (when AI unavailable)
function generateLocalWorld(description) {
    const keywords = description.toLowerCase();
    
    // Detect themes
    const themes = {
        space: { keywords: ['space', 'star', 'galaxy', 'nebula', 'planet', 'orbit', 'asteroid'], 
                 emojis: ['🌟', '⭐', '✨', '🌙', '🪐', '☄️', '🛸', '🚀', '🌌'],
                 colors: ['#0a0a1a', '#1a1a3a', '#2d1b69'], particles: 'stars', particleColor: '#ffffff' },
        forest: { keywords: ['forest', 'tree', 'wood', 'nature', 'enchanted', 'fairy', 'mushroom'],
                  emojis: ['🌲', '🌳', '🍄', '🧚', '🦋', '🌸', '🦌', '🌿', '🍃', '✨'],
                  colors: ['#0d1f0d', '#1a3a1a', '#2d4a2d'], particles: 'fireflies', particleColor: '#90EE90' },
        ocean: { keywords: ['ocean', 'sea', 'underwater', 'fish', 'coral', 'beach', 'water'],
                 emojis: ['🐠', '🐟', '🦀', '🐙', '🦑', '🐚', '🌊', '🪸', '🐬', '💎'],
                 colors: ['#001a33', '#003366', '#0055aa'], particles: 'bubbles', particleColor: '#87CEEB' },
        winter: { keywords: ['snow', 'winter', 'cold', 'ice', 'cabin', 'christmas', 'frost'],
                  emojis: ['❄️', '⛄', '🎄', '🏠', '🌲', '🦌', '🎅', '🌨️', '🧣'],
                  colors: ['#1a2a3a', '#2a3a4a', '#4a5a6a'], particles: 'snow', particleColor: '#ffffff' },
        desert: { keywords: ['desert', 'sand', 'pyramid', 'egypt', 'cactus', 'oasis'],
                  emojis: ['🏜️', '🌵', '🐫', '🦂', '🏺', '☀️', '🌴', '⛺'],
                  colors: ['#3d2914', '#5c4020', '#8b6914'], particles: 'dust', particleColor: '#d4a574' },
        zen: { keywords: ['zen', 'japan', 'garden', 'bamboo', 'koi', 'cherry', 'peaceful'],
               emojis: ['🎋', '🌸', '🐟', '🪷', '⛩️', '🗻', '🎎', '🏯', '💮'],
               colors: ['#1a1a2e', '#2d2d44', '#3d3d5c'], particles: 'none', particleColor: '#ffffff' },
        cave: { keywords: ['cave', 'crystal', 'underground', 'gem', 'mine', 'dark'],
                emojis: ['💎', '🔮', '🕯️', '🦇', '💠', '🪨', '✨', '🌋'],
                colors: ['#0d0d1a', '#1a1a2d', '#2d2d4a'], particles: 'dust', particleColor: '#9370DB' }
    };
    
    // Find matching theme
    let matchedTheme = null;
    for (const [name, theme] of Object.entries(themes)) {
        if (theme.keywords.some(kw => keywords.includes(kw))) {
            matchedTheme = theme;
            break;
        }
    }
    
    // Default cosmic theme
    if (!matchedTheme) {
        matchedTheme = themes.space;
    }
    
    // Generate elements
    const elements = [];
    const usedEmojis = new Set();
    const numElements = 10 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numElements; i++) {
        let emoji;
        do {
            emoji = matchedTheme.emojis[Math.floor(Math.random() * matchedTheme.emojis.length)];
        } while (usedEmojis.has(emoji) && usedEmojis.size < matchedTheme.emojis.length);
        usedEmojis.add(emoji);
        
        elements.push({
            emoji,
            x: 5 + Math.random() * 90,
            y: 10 + Math.random() * 75,
            size: 0.6 + Math.random() * 1.8,
            animation: ['float', 'pulse', 'twinkle', 'none'][Math.floor(Math.random() * 4)],
            layer: Math.ceil(Math.random() * 3)
        });
    }
    
    return {
        title: 'Mystic Realm',
        mood: 'magical',
        colors: matchedTheme.colors,
        elements,
        particles: { type: matchedTheme.particles, color: matchedTheme.particleColor },
        description: 'A world born from imagination...'
    };
}

// Particle system
class Particle {
    constructor(type, color) {
        this.type = type;
        this.color = color;
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * worldCanvas.width;
        this.y = Math.random() * worldCanvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedY = this.type === 'snow' ? Math.random() * 1 + 0.5 :
                      this.type === 'rain' ? Math.random() * 5 + 3 :
                      this.type === 'bubbles' ? -(Math.random() * 1 + 0.3) :
                      0;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }
    
    update() {
        if (this.type === 'fireflies' || this.type === 'stars') {
            this.twinklePhase += this.twinkleSpeed;
            this.opacity = 0.3 + Math.sin(this.twinklePhase) * 0.5;
            if (this.type === 'fireflies') {
                this.x += Math.sin(this.twinklePhase * 2) * 0.5;
                this.y += Math.cos(this.twinklePhase * 1.5) * 0.3;
            }
        } else {
            this.y += this.speedY;
            this.x += this.speedX;
            
            if (this.y > worldCanvas.height + 10) this.y = -10;
            if (this.y < -10) this.y = worldCanvas.height + 10;
            if (this.x > worldCanvas.width) this.x = 0;
            if (this.x < 0) this.x = worldCanvas.width;
        }
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        if (this.type === 'stars' || this.type === 'fireflies') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Create particles
function createParticles(type, color, count = 50) {
    particles = [];
    if (type === 'none') return;
    
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(type, color));
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, worldCanvas.width, worldCanvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    animationId = requestAnimationFrame(animate);
}

// Render world
function renderWorld(world) {
    // Stop previous animation
    if (animationId) cancelAnimationFrame(animationId);
    
    // Hide placeholder
    placeholder.classList.add('hidden');
    
    // Set background gradient
    worldContainer.style.background = `linear-gradient(180deg, ${world.colors.join(', ')})`;
    
    // Clear and create elements
    worldElements.innerHTML = '';
    
    // Sort by layer
    const sortedElements = [...world.elements].sort((a, b) => a.layer - b.layer);
    
    sortedElements.forEach((el, index) => {
        const elem = document.createElement('div');
        elem.className = 'world-element';
        if (el.animation !== 'none') {
            elem.classList.add(`animate-${el.animation}`);
        }
        elem.textContent = el.emoji;
        elem.style.left = `${el.x}%`;
        elem.style.top = `${el.y}%`;
        elem.style.fontSize = `${el.size * 2}rem`;
        elem.style.opacity = el.layer === 1 ? 0.5 : el.layer === 2 ? 0.8 : 1;
        elem.style.animationDelay = `${index * 0.1}s`;
        elem.style.zIndex = el.layer;
        
        // Add tooltip
        elem.title = `Layer ${el.layer}`;
        
        worldElements.appendChild(elem);
    });
    
    // Create particles
    createParticles(world.particles.type, world.particles.color);
    animate();
    
    // Show info
    worldInfo.innerHTML = `<h3>${world.title}</h3><p>${world.description}</p>`;
    worldInfo.classList.add('visible');
}

// Generate world
async function generateWorld() {
    const description = descriptionInput.value.trim();
    if (!description) return;
    
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    worldInfo.classList.remove('visible');
    
    try {
        const world = await askAI(description);
        renderWorld(world);
    } catch (error) {
        console.error('Generation error:', error);
        // Use local fallback
        const world = generateLocalWorld(description);
        renderWorld(world);
    } finally {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
}

// Event listeners
generateBtn.addEventListener('click', generateWorld);

descriptionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateWorld();
    }
});

exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        descriptionInput.value = btn.dataset.prompt;
        generateWorld();
    });
});

// Initial demo on load (with local generation for instant feedback)
setTimeout(() => {
    if (!descriptionInput.value) {
        descriptionInput.value = 'A magical night sky with shooting stars and a distant aurora';
        const world = generateLocalWorld(descriptionInput.value);
        renderWorld(world);
    }
}, 500);
