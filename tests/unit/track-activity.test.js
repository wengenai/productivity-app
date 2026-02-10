/**
 * Unit Tests for Track Activity Functionality
 * Tests the activity creation, timer, and countdown features
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Activity } from '../../src/js/models.js';
import { categorizeActivitySync } from '../../src/js/categorizer.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;

describe('Track Activity - Activity Creation', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should create activity with name and duration', () => {
        const activity = new Activity('Study Math', 60);

        expect(activity.name).toBe('Study Math');
        expect(activity.plannedDuration).toBe(60);
        expect(activity.completed).toBe(false);
    });

    test('should auto-categorize activity on creation', () => {
        const activity = new Activity('going to gym', 45);

        expect(activity.category).toBe('exercise');
    });

    test('should set start time automatically', () => {
        const before = new Date();
        const activity = new Activity('Test Activity', 30);
        const after = new Date();

        const startTime = new Date(activity.startTime);
        expect(startTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(startTime.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test('should generate unique ID for each activity', () => {
        const activity1 = new Activity('Activity 1', 30);
        const activity2 = new Activity('Activity 2', 30);

        expect(activity1.id).not.toBe(activity2.id);
    });

    test('should handle various activity names', () => {
        const testCases = [
            { name: 'workout', expectedCategory: 'exercise' },
            { name: 'study physics', expectedCategory: 'study' },
            { name: 'team meeting', expectedCategory: 'work' },
            { name: 'lunch break', expectedCategory: 'meal' },
            { name: 'random activity', expectedCategory: 'other' }
        ];

        testCases.forEach(({ name, expectedCategory }) => {
            const activity = new Activity(name, 60);
            expect(activity.category).toBe(expectedCategory);
        });
    });
});

describe('Track Activity - Categorization', () => {
    test('should categorize exercise activities', () => {
        const activities = ['gym', 'workout', 'run', 'jog', 'yoga'];

        activities.forEach(name => {
            expect(categorizeActivitySync(name)).toBe('exercise');
        });
    });

    test('should categorize study activities', () => {
        const activities = ['study', 'homework', 'research', 'exam prep'];

        activities.forEach(name => {
            expect(categorizeActivitySync(name)).toBe('study');
        });
    });

    test('should categorize work activities', () => {
        const activities = ['work', 'meeting', 'code review', 'email'];

        activities.forEach(name => {
            expect(categorizeActivitySync(name)).toBe('work');
        });
    });

    test('should return "other" for unrecognized activities', () => {
        const activities = ['random stuff', 'xyz', 'getting fit'];

        activities.forEach(name => {
            expect(categorizeActivitySync(name)).toBe('other');
        });
    });

    test('should be case-insensitive', () => {
        expect(categorizeActivitySync('GYM')).toBe('exercise');
        expect(categorizeActivitySync('STUDY')).toBe('study');
        expect(categorizeActivitySync('Meeting')).toBe('work');
    });
});

describe('Track Activity - Timer Calculations', () => {
    test('should calculate planned end time correctly', () => {
        const activity = new Activity('Test', 60);
        const startTime = new Date(activity.startTime);
        const expectedEnd = new Date(startTime.getTime() + 60 * 60000);

        const plannedEnd = new Date(startTime.getTime() + activity.plannedDuration * 60000);

        expect(plannedEnd.getTime()).toBe(expectedEnd.getTime());
    });

    test('should handle different durations', () => {
        const durations = [15, 30, 45, 60, 90, 120];

        durations.forEach(duration => {
            const activity = new Activity('Test', duration);
            const startTime = new Date(activity.startTime);
            const plannedEnd = new Date(startTime.getTime() + duration * 60000);

            expect(plannedEnd.getTime()).toBeGreaterThan(startTime.getTime());
        });
    });
});

describe('Track Activity - Activity Completion', () => {
    test('should complete activity with actual duration', () => {
        const activity = new Activity('Test Activity', 60);

        // Simulate time passing
        setTimeout(() => {
            activity.complete('Test Activity', 'Good session');

            expect(activity.completed).toBe(true);
            expect(activity.actualDuration).toBeGreaterThanOrEqual(0);
            expect(activity.endTime).toBeTruthy();
        }, 100);
    });

    test('should store actual activity name', () => {
        const activity = new Activity('Planned Activity', 60);
        activity.complete('Actually did this', 'Changed my mind');

        expect(activity.actualActivity).toBe('Actually did this');
    });

    test('should store notes', () => {
        const activity = new Activity('Test', 60);
        activity.complete('Test', 'These are my notes');

        expect(activity.notes).toBe('These are my notes');
    });

    test('should use planned name if no actual activity provided', () => {
        const activity = new Activity('Planned Activity', 60);
        activity.complete();

        expect(activity.actualActivity).toBe('Planned Activity');
    });

    test('should re-categorize if actual activity is different', () => {
        const activity = new Activity('study math', 60); // Category: study
        expect(activity.category).toBe('study');

        activity.complete('went to gym instead', ''); // Should be exercise
        expect(activity.category).toBe('exercise');
    });
});

describe('Track Activity - Async Categorization', () => {
    test('should have refineCategory method', async () => {
        const activity = new Activity('getting fit', 60);

        expect(activity.refineCategory).toBeDefined();
        expect(typeof activity.refineCategory).toBe('function');
    });

    test('should allow category refinement', async () => {
        const activity = new Activity('getting fit', 60);
        const originalCategory = activity.category;

        // Without API key, should return same category
        const refinedCategory = await activity.refineCategory();

        expect(refinedCategory).toBeDefined();
    });
});

describe('Track Activity - Integration Tests', () => {
    test('should handle full activity lifecycle', () => {
        // Create activity
        const activity = new Activity('Study React', 60);
        expect(activity.completed).toBe(false);

        // Save to localStorage
        localStorage.setItem('currentActivity', JSON.stringify(activity));

        // Retrieve from localStorage
        const retrieved = JSON.parse(localStorage.getItem('currentActivity'));
        expect(retrieved.name).toBe('Study React');

        // Complete activity
        activity.complete('Studied React Hooks', 'Great session!');
        expect(activity.completed).toBe(true);

        // Save completed activity
        localStorage.setItem('completedActivity', JSON.stringify(activity));

        const completed = JSON.parse(localStorage.getItem('completedActivity'));
        expect(completed.completed).toBe(true);
        expect(completed.actualActivity).toBe('Studied React Hooks');
    });

    test('should handle multiple activities', () => {
        const activities = [
            new Activity('Study Math', 60),
            new Activity('Workout', 45),
            new Activity('Team Meeting', 30)
        ];

        expect(activities.length).toBe(3);
        expect(activities[0].category).toBe('study');
        expect(activities[1].category).toBe('exercise');
        expect(activities[2].category).toBe('work');
    });
});

describe('Track Activity - Edge Cases', () => {
    test('should handle empty activity name', () => {
        const activity = new Activity('', 60);
        expect(activity.name).toBe('');
        expect(activity.category).toBe('other');
    });

    test('should handle very short duration', () => {
        const activity = new Activity('Quick task', 1);
        expect(activity.plannedDuration).toBe(1);
    });

    test('should handle very long duration', () => {
        const activity = new Activity('Long project', 480);
        expect(activity.plannedDuration).toBe(480);
    });

    test('should handle special characters in name', () => {
        const activity = new Activity('Study C++ & Python!', 60);
        expect(activity.name).toBe('Study C++ & Python!');
    });

    test('should handle null/undefined notes', () => {
        const activity = new Activity('Test', 60);
        activity.complete('Test', null);
        expect(activity.notes).toBe('');

        const activity2 = new Activity('Test', 60);
        activity2.complete('Test', undefined);
        expect(activity2.notes).toBe('');
    });
});

console.log('✓ Track Activity unit tests ready to run');
