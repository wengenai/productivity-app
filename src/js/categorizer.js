// Hybrid Activity Categorization (Keywords + Claude AI)

import { config } from './config.js';
import { aiCategorizer } from './ai-categorizer.js';

export const CATEGORIES = {
    'exercise': ['gym', 'workout', 'run', 'jog', 'swim', 'yoga', 'fitness', 'sport', 'bike', 'hike', 'walk', 'exercise', 'training'],
    'study': ['study', 'learn', 'homework', 'research', 'review', 'exam', 'quiz', 'assignment', 'reading', 'practice'],
    'work': ['work', 'meeting', 'project', 'code', 'programming', 'design', 'email', 'call', 'presentation', 'deadline', 'task', 'office'],
    'meal': ['breakfast', 'lunch', 'dinner', 'brunch', 'snack', 'eat', 'meal', 'cook', 'food', 'restaurant'],
    'social': ['party', 'hangout', 'friend', 'date', 'gathering', 'meet', 'chat', 'call', 'visit', 'celebrate'],
    'class': ['class', 'lecture', 'seminar', 'course', 'lesson', 'tutorial', 'workshop'],
    'entertainment': ['movie', 'tv', 'show', 'game', 'video', 'music', 'concert', 'theater', 'netflix', 'youtube'],
    'reading': ['read', 'book', 'article', 'blog', 'news', 'magazine', 'novel', 'paper'],
    'personal': ['shower', 'sleep', 'nap', 'rest', 'grooming', 'meditation', 'relax'],
    'chores': ['clean', 'laundry', 'dishes', 'grocery', 'shopping', 'organize', 'errands'],
    'commute': ['drive', 'bus', 'train', 'commute', 'travel', 'transit'],
    'hobby': ['hobby', 'craft', 'paint', 'draw', 'photo', 'write', 'journal', 'creative'],
    'other': []
};

// Keyword-based categorization (fast, free, always available)
function categorizeWithKeywords(activityName) {
    if (!activityName) return 'other';

    const lowerName = activityName.toLowerCase();

    // Check each category's keywords
    for (const [category, keywords] of Object.entries(CATEGORIES)) {
        if (category === 'other') continue;

        // Check if any keyword appears in the activity name
        for (const keyword of keywords) {
            if (lowerName.includes(keyword)) {
                return category;
            }
        }
    }

    // If no match found, return 'other'
    return 'other';
}

// Hybrid categorization: Keywords first, AI for ambiguous cases
export async function categorizeActivity(activityName) {
    if (!activityName) return 'other';

    const mode = config.getCategorizationMode();

    // Mode 1: Never use AI (keywords only)
    if (mode === 'never' || !config.isAICategorizationEnabled()) {
        return categorizeWithKeywords(activityName);
    }

    // Mode 2: Always use AI (if available)
    if (mode === 'always') {
        const aiCategory = await aiCategorizer.categorizeWithAI(activityName);
        return aiCategory || categorizeWithKeywords(activityName); // Fallback to keywords
    }

    // Mode 3: Hybrid (default) - Keywords first, AI for 'other' category
    const keywordCategory = categorizeWithKeywords(activityName);

    // If keyword matching found a confident match, use it
    if (keywordCategory !== 'other') {
        return keywordCategory;
    }

    // If keyword matching returned 'other', try AI for better accuracy
    console.log('Keyword match inconclusive, trying AI for:', activityName);
    const aiCategory = await aiCategorizer.categorizeWithAI(activityName);

    // Use AI result if available, otherwise stick with 'other'
    return aiCategory || 'other';
}

// Synchronous version for backward compatibility (uses keywords only)
export function categorizeActivitySync(activityName) {
    return categorizeWithKeywords(activityName);
}

export function getCategoryColor(category) {
    const colors = {
        'exercise': '#28a745',
        'study': '#667eea',
        'work': '#fd7e14',
        'meal': '#ffc107',
        'social': '#e83e8c',
        'class': '#6610f2',
        'entertainment': '#17a2b8',
        'reading': '#20c997',
        'personal': '#6c757d',
        'chores': '#dc3545',
        'commute': '#343a40',
        'hobby': '#9b59b6',
        'other': '#adb5bd'
    };

    return colors[category] || colors['other'];
}

export function getCategoryIcon(category) {
    const icons = {
        'exercise': '💪',
        'study': '📚',
        'work': '💼',
        'meal': '🍽️',
        'social': '👥',
        'class': '🎓',
        'entertainment': '🎬',
        'reading': '📖',
        'personal': '🧘',
        'chores': '🧹',
        'commute': '🚗',
        'hobby': '🎨',
        'other': '📝'
    };

    return icons[category] || icons['other'];
}

export function getAllCategories() {
    return Object.keys(CATEGORIES);
}
