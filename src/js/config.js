// API Configuration

export class Config {
    constructor() {
        this.storageKey = 'activityTracker_config';
        this.config = this.loadConfig();
    }

    loadConfig() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Failed to load config:', error);
            }
        }

        return {
            anthropicApiKey: null,
            useAICategorization: false,
            aiCategorizationMode: 'hybrid' // 'hybrid', 'always', 'never'
        };
    }

    saveConfig(updates) {
        this.config = { ...this.config, ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    }

    getAnthropicApiKey() {
        return this.config.anthropicApiKey;
    }

    setAnthropicApiKey(key) {
        this.saveConfig({
            anthropicApiKey: key,
            useAICategorization: key ? true : false
        });
    }

    isAICategorizationEnabled() {
        return this.config.useAICategorization && this.config.anthropicApiKey;
    }

    getCategorizationMode() {
        return this.config.aiCategorizationMode || 'hybrid';
    }

    setCategorizationMode(mode) {
        this.saveConfig({ aiCategorizationMode: mode });
    }
}

export const config = new Config();
