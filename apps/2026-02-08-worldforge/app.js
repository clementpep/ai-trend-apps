// WorldForge - AI Adventure Generator
class WorldForge {
    constructor() {
        this.worldDescription = '';
        this.genre = '';
        this.storyHistory = [];
        this.turnCount = 0;
        
        this.setupPhase = document.getElementById('setup-phase');
        this.adventurePhase = document.getElementById('adventure-phase');
        this.storyScroll = document.getElementById('story-scroll');
        this.choicesContainer = document.getElementById('choices-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.turnCounter = document.getElementById('turn-counter');
        
        this.init();
    }
    
    init() {
        document.getElementById('start-btn').addEventListener('click', () => this.startAdventure());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }
    
    async askAI(messages) {
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages,
                    model: 'gpt-4o-mini',
                    max_tokens: 800
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error('AI API Error:', error);
            return null;
        }
    }
    
    async startAdventure() {
        const worldInput = document.getElementById('world-input');
        const genreSelect = document.getElementById('genre-select');
        const startBtn = document.getElementById('start-btn');
        
        this.worldDescription = worldInput.value.trim();
        this.genre = genreSelect.options[genreSelect.selectedIndex].text;
        
        if (!this.worldDescription) {
            this.worldDescription = worldInput.placeholder;
        }
        
        // Show loading state
        startBtn.disabled = true;
        startBtn.querySelector('.btn-text').hidden = true;
        startBtn.querySelector('.btn-loading').hidden = false;
        
        // Generate the opening
        const opening = await this.generateOpening();
        
        if (opening) {
            this.setupPhase.hidden = true;
            this.adventurePhase.hidden = false;
            this.displayStorySegment(opening.story);
            this.displayChoices(opening.choices);
            this.turnCount = 1;
            this.updateTurnCounter();
        } else {
            // Fallback for demo/local mode
            this.setupPhase.hidden = true;
            this.adventurePhase.hidden = false;
            this.displayFallbackOpening();
        }
        
        // Reset button
        startBtn.disabled = false;
        startBtn.querySelector('.btn-text').hidden = false;
        startBtn.querySelector('.btn-loading').hidden = true;
    }
    
    async generateOpening() {
        const systemPrompt = `You are an interactive fiction writer. You create immersive text adventures.
        
RULES:
- Write in second person ("You stand at the edge...")
- Be vivid and atmospheric
- Keep story segments to 2-3 paragraphs
- Always end with exactly 3 distinct choices for the player
- Format response as JSON: {"story": "...", "choices": ["choice1", "choice2", "choice3"]}`;

        const userPrompt = `Create the opening scene for a ${this.genre} adventure in this world:

"${this.worldDescription}"

Set the scene, introduce the protagonist's situation, and present 3 interesting choices for how to proceed.`;

        const response = await this.askAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);
        
        if (!response) return null;
        
        try {
            // Extract JSON from response (handle markdown code blocks)
            let jsonStr = response;
            const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1];
            }
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse AI response:', e);
            return null;
        }
    }
    
    async continueStory(choice) {
        this.showLoading(true);
        this.disableChoices();
        
        // Add chosen action to story
        this.displayChoiceMade(choice);
        this.storyHistory.push({ type: 'choice', text: choice });
        
        const systemPrompt = `You are an interactive fiction writer continuing an adventure.

RULES:
- Continue the story based on the player's choice
- Write in second person
- Be vivid, include consequences of their choice
- Keep to 2-3 paragraphs
- End with exactly 3 new choices
- Format as JSON: {"story": "...", "choices": ["choice1", "choice2", "choice3"]}

WORLD: ${this.genre} - ${this.worldDescription}`;

        const storyContext = this.storyHistory
            .slice(-6)
            .map(s => s.type === 'choice' ? `Player chose: ${s.text}` : s.text)
            .join('\n\n');

        const response = await this.askAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Story so far:\n${storyContext}\n\nThe player chose: "${choice}"\n\nContinue the adventure.` }
        ]);
        
        this.showLoading(false);
        
        if (response) {
            try {
                let jsonStr = response;
                const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[1];
                }
                const parsed = JSON.parse(jsonStr);
                this.displayStorySegment(parsed.story);
                this.storyHistory.push({ type: 'story', text: parsed.story });
                this.displayChoices(parsed.choices);
                this.turnCount++;
                this.updateTurnCounter();
            } catch (e) {
                this.displayStorySegment("The path forward becomes unclear... (API response error)");
                this.displayChoices(["Try to find another way", "Look around for clues", "Rest and reconsider"]);
            }
        } else {
            this.generateFallbackContinuation(choice);
        }
        
        this.scrollToBottom();
    }
    
    displayStorySegment(text) {
        const segment = document.createElement('div');
        segment.className = 'story-segment';
        segment.textContent = text;
        this.storyScroll.appendChild(segment);
        this.scrollToBottom();
    }
    
    displayChoiceMade(choice) {
        const segment = document.createElement('div');
        segment.className = 'story-segment choice-made';
        segment.textContent = choice;
        this.storyScroll.appendChild(segment);
    }
    
    displayChoices(choices) {
        this.choicesContainer.innerHTML = '';
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.addEventListener('click', () => this.continueStory(choice));
            this.choicesContainer.appendChild(btn);
        });
    }
    
    disableChoices() {
        this.choicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
    }
    
    showLoading(show) {
        this.loadingIndicator.hidden = !show;
        this.choicesContainer.style.display = show ? 'none' : 'flex';
    }
    
    updateTurnCounter() {
        this.turnCounter.textContent = `Turn: ${this.turnCount}`;
    }
    
    scrollToBottom() {
        const container = document.querySelector('.story-container');
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
    
    restart() {
        this.storyHistory = [];
        this.turnCount = 0;
        this.storyScroll.innerHTML = '';
        this.choicesContainer.innerHTML = '';
        this.adventurePhase.hidden = true;
        this.setupPhase.hidden = false;
    }
    
    // Fallback content for demo/local testing
    displayFallbackOpening() {
        const fallbackStory = `You awaken in the heart of ${this.worldDescription.slice(0, 100)}... The air crackles with energy, and you sense that your choices here will shape the fate of everything you encounter.

Before you lies a crossroads of destiny. The path ahead splits three ways, each promising adventure and danger in equal measure. Your heart pounds as you consider your options.`;
        
        this.displayStorySegment(fallbackStory);
        this.storyHistory.push({ type: 'story', text: fallbackStory });
        this.displayChoices([
            "Take the shadowy path to the left",
            "Follow the main road straight ahead",
            "Investigate the strange sounds from the right"
        ]);
        this.turnCount = 1;
        this.updateTurnCounter();
    }
    
    generateFallbackContinuation(choice) {
        const continuations = [
            `Your decision to ${choice.toLowerCase()} leads you deeper into the unknown. The world around you shifts and changes, responding to your presence in ways you couldn't have predicted.`,
            `As you ${choice.toLowerCase()}, the consequences of your choice ripple outward. New challenges emerge, but so do new opportunities.`,
            `The path unfolds before you as you ${choice.toLowerCase()}. Each step brings new mysteries and revelations.`
        ];
        
        const story = continuations[Math.floor(Math.random() * continuations.length)];
        this.displayStorySegment(story);
        this.storyHistory.push({ type: 'story', text: story });
        
        this.displayChoices([
            "Press forward with determination",
            "Search for hidden secrets",
            "Seek allies in this strange place"
        ]);
        this.turnCount++;
        this.updateTurnCounter();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new WorldForge();
});
