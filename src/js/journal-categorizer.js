// AI-powered journal entry categorization using Claude (Anthropic API)

import { config } from './config.js';

class JournalCategorizerService {
    constructor() {
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-haiku-20240307'; // Fast and cheap
        this.cache = this.loadCache();
        this.lastCategorizationText = null;
        this.debounceTimer = null;
    }

    loadCache() {
        const saved = localStorage.getItem('activityTracker_journalCategoryCache');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Failed to load journal category cache:', error);
            }
        }
        return {};
    }

    saveCache() {
        try {
            localStorage.setItem('activityTracker_journalCategoryCache', JSON.stringify(this.cache));
        } catch (error) {
            console.error('Failed to save journal category cache:', error);
        }
    }

    getCachedCategory(content) {
        const key = content.toLowerCase().trim().substring(0, 100); // Use first 100 chars as key
        return this.cache[key];
    }

    setCachedCategory(content, category) {
        const key = content.toLowerCase().trim().substring(0, 100);
        this.cache[key] = category;
        this.saveCache();
    }

    async categorizeJournal(content) {
        // Check cache first
        const cached = this.getCachedCategory(content);
        if (cached) {
            console.log('Using cached journal categorization:', cached);
            return cached;
        }

        const apiKey = config.getAnthropicApiKey();
        if (!apiKey) {
            console.warn('No Anthropic API key configured for journal categorization');
            return null;
        }

        try {
            console.log('Categorizing journal entry with AI...');

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 20,
                    messages: [{
                        role: 'user',
                        content: `Categorize this journal entry as either "learning" or "thought".

Journal entry: "${content}"

Rules:
- "learning" = factual knowledge, skills, insights gained, discoveries, realizations about how something works
- "thought" = personal reflections, opinions, feelings, plans, questions, philosophical musings
- Reply with ONLY the word "learning" or "thought", nothing else

Category:`
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Anthropic API error:', response.status, error);
                return null;
            }

            const data = await response.json();
            const category = data.content[0].text.trim().toLowerCase();

            // Validate the category
            if (category === 'learning' || category === 'thought') {
                // Cache the result
                this.setCachedCategory(content, category);
                console.log('AI journal categorization:', category);
                return category;
            } else {
                console.warn('AI returned invalid journal category:', category);
                return null;
            }

        } catch (error) {
            console.error('Failed to categorize journal with AI:', error);
            return null;
        }
    }

    // Debounced categorization for real-time updates
    categorizeDebounced(content, callback, delay = 1500) {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Don't categorize empty content
        if (!content || content.trim().length < 10) {
            callback(null); // Clear indicator
            return;
        }

        // Check if content hasn't changed (avoid re-categorizing same text)
        if (content === this.lastCategorizationText) {
            return;
        }

        // Set new timer
        this.debounceTimer = setTimeout(async () => {
            this.lastCategorizationText = content;
            const category = await this.categorizeJournal(content);
            callback(category || 'thought'); // Default to 'thought' on error
        }, delay);
    }

    clearCache() {
        this.cache = {};
        localStorage.removeItem('activityTracker_journalCategoryCache');
        console.log('Journal category cache cleared');
    }

    getCacheStats() {
        const entries = Object.keys(this.cache).length;
        return {
            entries,
            estimatedCost: entries * 0.00015 // Approximate cost per categorization
        };
    }
}

export const journalCategorizer = new JournalCategorizerService();
