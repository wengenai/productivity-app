// AI-powered categorization using Claude (Anthropic API)

import { config } from './config.js';

class AICategorizerService {
    constructor() {
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-haiku-20240307'; // Fast and cheap
        this.cache = this.loadCache();
    }

    loadCache() {
        const saved = localStorage.getItem('activityTracker_aiCategoryCache');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Failed to load AI category cache:', error);
            }
        }
        return {};
    }

    saveCache() {
        try {
            localStorage.setItem('activityTracker_aiCategoryCache', JSON.stringify(this.cache));
        } catch (error) {
            console.error('Failed to save AI category cache:', error);
        }
    }

    getCachedCategory(activityName) {
        const key = activityName.toLowerCase().trim();
        return this.cache[key];
    }

    setCachedCategory(activityName, category) {
        const key = activityName.toLowerCase().trim();
        this.cache[key] = category;
        this.saveCache();
    }

    async categorizeWithAI(activityName) {
        // Check cache first
        const cached = this.getCachedCategory(activityName);
        if (cached) {
            console.log('Using cached AI categorization for:', activityName, '→', cached);
            return cached;
        }

        const apiKey = config.getAnthropicApiKey();
        if (!apiKey) {
            console.warn('No Anthropic API key configured');
            return null;
        }

        try {
            console.log('Categorizing with AI:', activityName);

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 30,
                    messages: [{
                        role: 'user',
                        content: `Categorize this activity into exactly ONE of these categories:
exercise, study, work, meal, social, class, entertainment, reading, personal, chores, commute, hobby, other

Activity: "${activityName}"

Rules:
- Choose the MOST appropriate category
- Consider context (e.g., "read email" is work, not reading)
- Reply with ONLY the category name, nothing else

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
            const validCategories = [
                'exercise', 'study', 'work', 'meal', 'social', 'class',
                'entertainment', 'reading', 'personal', 'chores', 'commute', 'hobby', 'other'
            ];

            if (validCategories.includes(category)) {
                // Cache the result
                this.setCachedCategory(activityName, category);
                console.log('AI categorization:', activityName, '→', category);
                return category;
            } else {
                console.warn('AI returned invalid category:', category);
                return null;
            }

        } catch (error) {
            console.error('Failed to categorize with AI:', error);
            return null;
        }
    }

    clearCache() {
        this.cache = {};
        localStorage.removeItem('activityTracker_aiCategoryCache');
        console.log('AI category cache cleared');
    }

    getCacheStats() {
        const entries = Object.keys(this.cache).length;
        return {
            entries,
            estimatedCost: entries * 0.00025 // Approximate cost per categorization
        };
    }
}

export const aiCategorizer = new AICategorizerService();
