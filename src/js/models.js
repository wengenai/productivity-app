// Data Models

import { categorizeActivity, categorizeActivitySync } from './categorizer.js';

export class Activity {
    constructor(name, plannedDuration, startTime) {
        this.id = Date.now() + Math.random();
        this.name = name;
        this.category = categorizeActivitySync(name); // Quick keyword categorization
        this.plannedDuration = plannedDuration; // in minutes
        this.startTime = startTime || new Date();
        this.endTime = null;
        this.actualDuration = null;
        this.completed = false;
        this.actualActivity = null; // what user actually did
        this.notes = '';
    }

    // Async method to refine category with AI (call after construction if needed)
    async refineCategory() {
        const aiCategory = await categorizeActivity(this.name);
        if (aiCategory && aiCategory !== this.category) {
            console.log(`Category refined: ${this.category} → ${aiCategory}`);
            this.category = aiCategory;
        }
        return this.category;
    }

    complete(actualActivity, notes) {
        this.endTime = new Date();
        this.actualDuration = Math.round((this.endTime - this.startTime) / 60000);
        this.completed = true;
        this.actualActivity = actualActivity || this.name;
        this.notes = notes || '';
        // Re-categorize based on actual activity if different (sync version for now)
        if (actualActivity && actualActivity !== this.name) {
            this.category = categorizeActivitySync(actualActivity);
        }
    }

    // Async complete method that uses AI categorization
    async completeWithAI(actualActivity, notes) {
        this.endTime = new Date();
        this.actualDuration = Math.round((this.endTime - this.startTime) / 60000);
        this.completed = true;
        this.actualActivity = actualActivity || this.name;
        this.notes = notes || '';
        // Re-categorize with AI based on actual activity if different
        if (actualActivity && actualActivity !== this.name) {
            this.category = await categorizeActivity(actualActivity);
        }
    }
}

export class Learning {
    constructor(content, tags) {
        this.id = Date.now() + Math.random();
        this.content = content;
        this.tags = tags || [];
        this.timestamp = new Date();
        this.type = 'learning';
    }
}

export class Thought {
    constructor(content, tags) {
        this.id = Date.now() + Math.random();
        this.content = content;
        this.tags = tags || [];
        this.timestamp = new Date();
        this.type = 'thought';
    }
}

export class Todo {
    constructor(title, dueDate, reminder) {
        this.id = Date.now() + Math.random();
        this.title = title;
        this.dueDate = dueDate;
        this.reminder = reminder;
        this.completed = false;
        this.createdAt = new Date();
    }

    toggleComplete() {
        this.completed = !this.completed;
    }
}

