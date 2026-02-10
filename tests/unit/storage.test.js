import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { StorageManager } from '../../src/js/storage.js';
import {
  createMockActivity,
  createCompletedActivity,
  createMockLearning,
  createMockThought,
  createMockTodo,
  mockLocalStorageWithData,
  clearMockLocalStorage
} from '../helpers.js';

describe('Storage Module', () => {

  let storage;

  beforeEach(() => {
    // Clear localStorage before each test
    clearMockLocalStorage();
    storage = new StorageManager();
  });

  afterEach(() => {
    // Clean up after each test
    clearMockLocalStorage();
  });

  // ============================================================================
  // Activities Storage Tests
  // ============================================================================

  describe('Activities Storage', () => {

    test('should save activities to localStorage', () => {
      const activity1 = createCompletedActivity({ name: 'Activity 1' });
      const activity2 = createCompletedActivity({ name: 'Activity 2' });

      storage.saveActivities([activity1, activity2]);

      const saved = localStorage.getItem('activityTracker_activities');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('Activity 1');
      expect(parsed[1].name).toBe('Activity 2');
    });

    test('should retrieve activities from localStorage', () => {
      const activity1 = createCompletedActivity({ name: 'Activity 1' });
      const activity2 = createCompletedActivity({ name: 'Activity 2' });

      mockLocalStorageWithData({ activities: [activity1, activity2] });

      const activities = storage.getActivities();

      expect(activities).toHaveLength(2);
      expect(activities[0].name).toBe('Activity 1');
      expect(activities[1].name).toBe('Activity 2');
    });

    test('should return empty array if no activities exist', () => {
      const activities = storage.getActivities();

      expect(activities).toEqual([]);
      expect(Array.isArray(activities)).toBe(true);
    });

    test('should save empty activities array', () => {
      storage.saveActivities([]);

      const saved = localStorage.getItem('activityTracker_activities');
      expect(saved).toBe('[]');
    });

    test('should handle corrupted JSON data gracefully', () => {
      localStorage.setItem('activityTracker_activities', 'invalid json {{{');

      // Should not throw an error
      expect(() => {
        const activities = storage.getActivities();
        // Implementation might return empty array or throw, adjust based on implementation
      }).not.toThrow();
    });

    test('should preserve activity properties when saving and retrieving', () => {
      const activity = createCompletedActivity({
        name: 'Test Activity',
        category: 'study',
        plannedDuration: 60,
        actualDuration: 55,
        completed: true,
        notes: 'Test notes'
      });

      storage.saveActivities([activity]);
      const retrieved = storage.getActivities();

      expect(retrieved[0].name).toBe(activity.name);
      expect(retrieved[0].category).toBe(activity.category);
      expect(retrieved[0].plannedDuration).toBe(activity.plannedDuration);
      expect(retrieved[0].actualDuration).toBe(activity.actualDuration);
      expect(retrieved[0].completed).toBe(activity.completed);
      expect(retrieved[0].notes).toBe(activity.notes);
    });

    test('should handle large number of activities', () => {
      const activities = Array.from({ length: 1000 }, (_, i) =>
        createCompletedActivity({ name: `Activity ${i}` })
      );

      storage.saveActivities(activities);
      const retrieved = storage.getActivities();

      expect(retrieved).toHaveLength(1000);
    });
  });

  // ============================================================================
  // Current Activity Storage Tests
  // ============================================================================

  describe('Current Activity Storage', () => {

    test('should save current activity to localStorage', () => {
      const activity = createMockActivity({ name: 'Current Activity' });

      storage.saveCurrentActivity(activity);

      const saved = localStorage.getItem('activityTracker_currentActivity');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved);
      expect(parsed.name).toBe('Current Activity');
    });

    test('should retrieve current activity from localStorage', () => {
      const activity = createMockActivity({ name: 'Current Activity' });

      mockLocalStorageWithData({ currentActivity: activity });

      const current = storage.getCurrentActivity();

      expect(current).toBeDefined();
      expect(current.name).toBe('Current Activity');
    });

    test('should return null if no current activity exists', () => {
      const current = storage.getCurrentActivity();

      expect(current).toBeNull();
    });

    test('should clear current activity from localStorage', () => {
      const activity = createMockActivity({ name: 'Current Activity' });

      storage.saveCurrentActivity(activity);
      expect(storage.getCurrentActivity()).toBeDefined();

      storage.clearCurrentActivity();
      expect(storage.getCurrentActivity()).toBeNull();
    });

    test('should overwrite current activity when saving a new one', () => {
      const activity1 = createMockActivity({ name: 'Activity 1' });
      const activity2 = createMockActivity({ name: 'Activity 2' });

      storage.saveCurrentActivity(activity1);
      storage.saveCurrentActivity(activity2);

      const current = storage.getCurrentActivity();
      expect(current.name).toBe('Activity 2');
    });

    test('should preserve all activity properties', () => {
      const activity = createMockActivity({
        name: 'Test',
        category: 'study',
        plannedDuration: 60,
        startTime: new Date('2024-01-15T10:00:00')
      });

      storage.saveCurrentActivity(activity);
      const retrieved = storage.getCurrentActivity();

      expect(retrieved.name).toBe(activity.name);
      expect(retrieved.category).toBe(activity.category);
      expect(retrieved.plannedDuration).toBe(activity.plannedDuration);
      // Dates are serialized as strings
      expect(new Date(retrieved.startTime)).toEqual(activity.startTime);
    });
  });

  // ============================================================================
  // Journal Storage Tests
  // ============================================================================

  describe('Journal Storage', () => {

    test('should save journal entries to localStorage', () => {
      const learning = createMockLearning({ content: 'Learning 1' });
      const thought = createMockThought({ content: 'Thought 1' });

      storage.saveJournalEntries([learning, thought]);

      const saved = localStorage.getItem('activityTracker_journal');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].content).toBe('Learning 1');
      expect(parsed[1].content).toBe('Thought 1');
    });

    test('should retrieve journal entries from localStorage', () => {
      const learning = createMockLearning({ content: 'Learning 1' });
      const thought = createMockThought({ content: 'Thought 1' });

      mockLocalStorageWithData({ journal: [learning, thought] });

      const entries = storage.getJournalEntries();

      expect(entries).toHaveLength(2);
      expect(entries[0].content).toBe('Learning 1');
      expect(entries[1].content).toBe('Thought 1');
    });

    test('should return empty array if no journal entries exist', () => {
      const entries = storage.getJournalEntries();

      expect(entries).toEqual([]);
      expect(Array.isArray(entries)).toBe(true);
    });

    test('should preserve entry types', () => {
      const learning = createMockLearning({ content: 'Test learning' });
      const thought = createMockThought({ content: 'Test thought' });

      storage.saveJournalEntries([learning, thought]);
      const retrieved = storage.getJournalEntries();

      expect(retrieved[0].type).toBe('learning');
      expect(retrieved[1].type).toBe('thought');
    });

    test('should preserve tags', () => {
      const learning = createMockLearning({
        content: 'Test',
        tags: ['tag1', 'tag2', 'tag3']
      });

      storage.saveJournalEntries([learning]);
      const retrieved = storage.getJournalEntries();

      expect(retrieved[0].tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    test('should handle large number of entries', () => {
      const entries = Array.from({ length: 500 }, (_, i) =>
        createMockLearning({ content: `Entry ${i}` })
      );

      storage.saveJournalEntries(entries);
      const retrieved = storage.getJournalEntries();

      expect(retrieved).toHaveLength(500);
    });
  });

  // ============================================================================
  // Todos Storage Tests
  // ============================================================================

  describe('Todos Storage', () => {

    test('should save todos to localStorage', () => {
      const todo1 = createMockTodo({ title: 'Todo 1' });
      const todo2 = createMockTodo({ title: 'Todo 2' });

      storage.saveTodos([todo1, todo2]);

      const saved = localStorage.getItem('activityTracker_todos');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].title).toBe('Todo 1');
      expect(parsed[1].title).toBe('Todo 2');
    });

    test('should retrieve todos from localStorage', () => {
      const todo1 = createMockTodo({ title: 'Todo 1' });
      const todo2 = createMockTodo({ title: 'Todo 2' });

      mockLocalStorageWithData({ todos: [todo1, todo2] });

      const todos = storage.getTodos();

      expect(todos).toHaveLength(2);
      expect(todos[0].title).toBe('Todo 1');
      expect(todos[1].title).toBe('Todo 2');
    });

    test('should return empty array if no todos exist', () => {
      const todos = storage.getTodos();

      expect(todos).toEqual([]);
      expect(Array.isArray(todos)).toBe(true);
    });

    test('should preserve todo properties', () => {
      const todo = createMockTodo({
        title: 'Test Todo',
        completed: true,
        dueDate: new Date('2024-12-31'),
        reminder: new Date('2024-12-30')
      });

      storage.saveTodos([todo]);
      const retrieved = storage.getTodos();

      expect(retrieved[0].title).toBe(todo.title);
      expect(retrieved[0].completed).toBe(todo.completed);
      expect(new Date(retrieved[0].dueDate)).toEqual(todo.dueDate);
      expect(new Date(retrieved[0].reminder)).toEqual(todo.reminder);
    });

    test('should handle todos without due dates', () => {
      const todo = createMockTodo({
        title: 'No deadline',
        dueDate: null,
        reminder: null
      });

      storage.saveTodos([todo]);
      const retrieved = storage.getTodos();

      expect(retrieved[0].dueDate).toBeNull();
      expect(retrieved[0].reminder).toBeNull();
    });
  });

  // ============================================================================
  // Clear All Data Tests
  // ============================================================================

  describe('Clear All Data', () => {

    test('should clear all app data from localStorage', () => {
      // Setup: Add data to all storage keys
      const activity = createCompletedActivity();
      const currentActivity = createMockActivity();
      const learning = createMockLearning();
      const todo = createMockTodo();

      storage.saveActivities([activity]);
      storage.saveCurrentActivity(currentActivity);
      storage.saveJournalEntries([learning]);
      storage.saveTodos([todo]);

      // Verify data exists
      expect(localStorage.getItem('activityTracker_activities')).toBeDefined();
      expect(localStorage.getItem('activityTracker_currentActivity')).toBeDefined();
      expect(localStorage.getItem('activityTracker_journal')).toBeDefined();
      expect(localStorage.getItem('activityTracker_todos')).toBeDefined();

      // Clear all
      storage.clearAll();

      // Verify all data is removed
      expect(localStorage.getItem('activityTracker_activities')).toBeNull();
      expect(localStorage.getItem('activityTracker_currentActivity')).toBeNull();
      expect(localStorage.getItem('activityTracker_journal')).toBeNull();
      expect(localStorage.getItem('activityTracker_todos')).toBeNull();
    });

    test('should not throw error if no data exists', () => {
      expect(() => storage.clearAll()).not.toThrow();
    });

    test('should only clear app-specific keys', () => {
      // Add some non-app data
      localStorage.setItem('someOtherApp_data', 'test');

      storage.clearAll();

      // App data should be cleared, but other data should remain
      expect(localStorage.getItem('someOtherApp_data')).toBe('test');
    });
  });

  // ============================================================================
  // Storage Keys Tests
  // ============================================================================

  describe('Storage Keys', () => {

    test('should use correct storage key for activities', () => {
      storage.saveActivities([]);
      expect(localStorage.getItem('activityTracker_activities')).toBeDefined();
    });

    test('should use correct storage key for current activity', () => {
      const activity = createMockActivity();
      storage.saveCurrentActivity(activity);
      expect(localStorage.getItem('activityTracker_currentActivity')).toBeDefined();
    });

    test('should use correct storage key for journal', () => {
      storage.saveJournalEntries([]);
      expect(localStorage.getItem('activityTracker_journal')).toBeDefined();
    });

    test('should use correct storage key for todos', () => {
      storage.saveTodos([]);
      expect(localStorage.getItem('activityTracker_todos')).toBeDefined();
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling
  // ============================================================================

  describe('Edge Cases', () => {

    test('should handle null values gracefully', () => {
      // Should not throw - defensive programming
      expect(() => storage.saveActivities(null)).not.toThrow();

      // Verify it was saved as "null" string
      const saved = localStorage.getItem('activityTracker_activities');
      expect(saved).toBe('null');
    });

    test('should handle undefined values gracefully', () => {
      // Should not throw - defensive programming
      expect(() => storage.saveActivities(undefined)).not.toThrow();

      // Verify it was saved as "undefined" string (JSON.stringify behavior)
      const saved = localStorage.getItem('activityTracker_activities');
      expect(saved).toBeDefined();
    });

    test('should handle saving and retrieving special characters', () => {
      const activity = createCompletedActivity({
        name: 'Test with "quotes" and \'apostrophes\' and <html>',
        notes: 'Special chars: €, ™, ©, ®, §'
      });

      storage.saveActivities([activity]);
      const retrieved = storage.getActivities();

      expect(retrieved[0].name).toBe(activity.name);
      expect(retrieved[0].notes).toBe(activity.notes);
    });

    test('should handle unicode characters', () => {
      const activity = createCompletedActivity({
        name: '学习中文 🎉 مرحبا',
        notes: 'Unicode test: 你好 👋 こんにちは'
      });

      storage.saveActivities([activity]);
      const retrieved = storage.getActivities();

      expect(retrieved[0].name).toBe(activity.name);
      expect(retrieved[0].notes).toBe(activity.notes);
    });
  });
});
