// Local Storage Manager

export class StorageManager {
    constructor() {
        this.keys = {
            activities: 'activityTracker_activities',
            journal: 'activityTracker_journal',
            todos: 'activityTracker_todos',
            currentActivity: 'activityTracker_currentActivity'
        };
    }

    // Activities
    saveActivities(activities) {
        localStorage.setItem(this.keys.activities, JSON.stringify(activities));
    }

    getActivities() {
        const data = localStorage.getItem(this.keys.activities);
        if (!data) return [];

        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to parse activities from localStorage:', error);
            return [];
        }
    }

    saveCurrentActivity(activity) {
        localStorage.setItem(this.keys.currentActivity, JSON.stringify(activity));
    }

    getCurrentActivity() {
        const data = localStorage.getItem(this.keys.currentActivity);
        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to parse current activity from localStorage:', error);
            return null;
        }
    }

    clearCurrentActivity() {
        localStorage.removeItem(this.keys.currentActivity);
    }

    // Journal (learnings and thoughts)
    saveJournalEntries(entries) {
        localStorage.setItem(this.keys.journal, JSON.stringify(entries));
    }

    getJournalEntries() {
        const data = localStorage.getItem(this.keys.journal);
        if (!data) return [];

        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to parse journal entries from localStorage:', error);
            return [];
        }
    }

    // Todos
    saveTodos(todos) {
        localStorage.setItem(this.keys.todos, JSON.stringify(todos));
    }

    getTodos() {
        const data = localStorage.getItem(this.keys.todos);
        if (!data) return [];

        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to parse todos from localStorage:', error);
            return [];
        }
    }

    // Clear all data
    clearAll() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}
