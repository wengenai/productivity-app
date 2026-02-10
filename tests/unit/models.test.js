import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Activity, Learning, Thought, Todo } from '../../src/js/models.js';
import { createMockActivity } from '../helpers.js';

describe('Models Module', () => {

  // ============================================================================
  // Activity Class Tests
  // ============================================================================

  describe('Activity Class', () => {

    describe('Activity Creation', () => {

      test('should create activity with required parameters', () => {
        const activity = new Activity('Study Math', 60);

        expect(activity).toBeDefined();
        expect(activity.name).toBe('Study Math');
        expect(activity.plannedDuration).toBe(60);
        expect(activity.id).toBeDefined();
        expect(activity.startTime).toBeInstanceOf(Date);
        expect(activity.category).toBeDefined();
      });

      test('should auto-categorize activity based on name', () => {
        const gymActivity = new Activity('Go to gym', 90);
        const studyActivity = new Activity('Study physics', 60);
        const workActivity = new Activity('Work meeting', 30);

        expect(gymActivity.category).toBe('exercise');
        expect(studyActivity.category).toBe('study');
        expect(workActivity.category).toBe('work');
      });

      test('should set startTime to current time by default', () => {
        const before = Date.now();
        const activity = new Activity('Read', 30);
        const after = Date.now();

        const activityTime = new Date(activity.startTime).getTime();
        expect(activityTime).toBeGreaterThanOrEqual(before);
        expect(activityTime).toBeLessThanOrEqual(after);
      });

      test('should allow custom startTime', () => {
        const customDate = new Date('2024-01-15T10:00:00');
        const activity = new Activity('Meeting', 60, customDate);

        expect(activity.startTime).toEqual(customDate);
      });

      test('should generate unique IDs for different activities', () => {
        const activity1 = new Activity('Activity 1', 30);
        const activity2 = new Activity('Activity 2', 30);

        expect(activity1.id).not.toBe(activity2.id);
      });

      test('should initialize with completed=false', () => {
        const activity = new Activity('Test', 30);

        expect(activity.completed).toBe(false);
        expect(activity.endTime).toBeNull();
        expect(activity.actualDuration).toBeNull();
      });

      test('should handle empty activity name', () => {
        const activity = new Activity('', 30);

        expect(activity.name).toBe('');
        expect(activity.category).toBe('other');
      });

      test('should handle very long activity names', () => {
        const longName = 'x'.repeat(1000);
        const activity = new Activity(longName, 30);

        expect(activity.name).toBe(longName);
        expect(activity.name.length).toBe(1000);
      });

      test('should handle zero duration', () => {
        const activity = new Activity('Test', 0);

        expect(activity.plannedDuration).toBe(0);
      });

      test('should handle negative duration', () => {
        const activity = new Activity('Test', -10);

        expect(activity.plannedDuration).toBe(-10);
        // Note: This might be a bug to fix - negative durations should be invalid
      });
    });

    describe('Activity Completion', () => {

      test('should complete activity with actual activity name', () => {
        const activity = new Activity('Study Math', 60);
        activity.complete('Actually studied Physics', 'Great session');

        expect(activity.completed).toBe(true);
        expect(activity.actualActivity).toBe('Actually studied Physics');
        expect(activity.notes).toBe('Great session');
        expect(activity.endTime).toBeInstanceOf(Date);
        expect(activity.actualDuration).toBeGreaterThanOrEqual(0); // Can be 0 if completed instantly
      });

      test('should use planned name if no actual activity provided', () => {
        const activity = new Activity('Study', 60);
        activity.complete('', '');

        expect(activity.actualActivity).toBe('Study');
      });

      test('should use planned name if actual activity is null', () => {
        const activity = new Activity('Study', 60);
        activity.complete(null, null);

        expect(activity.actualActivity).toBe('Study');
      });

      test('should recategorize if actual activity differs from planned', () => {
        const activity = new Activity('Study', 60);
        expect(activity.category).toBe('study');

        activity.complete('Went to gym', '');

        expect(activity.category).toBe('exercise');
      });

      test('should not recategorize if actual activity is same as planned', () => {
        const activity = new Activity('Study Math', 60);
        const originalCategory = activity.category;

        activity.complete('Study Math', '');

        expect(activity.category).toBe(originalCategory);
      });

      test('should calculate actualDuration correctly', () => {
        const startTime = new Date('2024-01-15T10:00:00');
        const activity = new Activity('Test', 60, startTime);

        // Mock the completion time to be 45 minutes later
        const mockEndTime = new Date('2024-01-15T10:45:00');
        jest.spyOn(global, 'Date').mockImplementation(() => mockEndTime);

        activity.complete('Test', '');

        expect(activity.actualDuration).toBe(45);

        jest.restoreAllMocks();
      });

      test('should set endTime to current time on completion', () => {
        const activity = new Activity('Test', 30);
        const before = Date.now();

        activity.complete('Test', '');

        const after = Date.now();
        const endTime = new Date(activity.endTime).getTime();

        expect(endTime).toBeGreaterThanOrEqual(before);
        expect(endTime).toBeLessThanOrEqual(after);
      });

      test('should handle empty notes', () => {
        const activity = new Activity('Test', 30);
        activity.complete('Test', '');

        expect(activity.notes).toBe('');
      });

      test('should handle null notes', () => {
        const activity = new Activity('Test', 30);
        activity.complete('Test', null);

        expect(activity.notes).toBe('');
      });
    });
  });

  // ============================================================================
  // Learning Class Tests
  // ============================================================================

  describe('Learning Class', () => {

    test('should create learning with content and tags', () => {
      const learning = new Learning('React hooks are powerful', ['react', 'hooks']);

      expect(learning.content).toBe('React hooks are powerful');
      expect(learning.tags).toEqual(['react', 'hooks']);
      expect(learning.type).toBe('learning');
      expect(learning.id).toBeDefined();
      expect(learning.timestamp).toBeInstanceOf(Date);
    });

    test('should create learning without tags', () => {
      const learning = new Learning('JavaScript tip', []);

      expect(learning.tags).toEqual([]);
    });

    test('should create learning with null tags', () => {
      const learning = new Learning('Test', null);

      expect(learning.tags).toEqual([]);
    });

    test('should create learning with undefined tags', () => {
      const learning = new Learning('Test');

      expect(learning.tags).toEqual([]);
    });

    test('should set type to "learning"', () => {
      const learning = new Learning('Test', []);

      expect(learning.type).toBe('learning');
    });

    test('should set timestamp to current time', () => {
      const before = Date.now();
      const learning = new Learning('Test', []);
      const after = Date.now();

      const timestamp = new Date(learning.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    test('should generate unique IDs', () => {
      const learning1 = new Learning('Learning 1', []);
      const learning2 = new Learning('Learning 2', []);

      expect(learning1.id).not.toBe(learning2.id);
    });

    test('should handle long content', () => {
      const longContent = 'x'.repeat(10000);
      const learning = new Learning(longContent, []);

      expect(learning.content).toBe(longContent);
    });

    test('should handle many tags', () => {
      const manyTags = Array.from({ length: 100 }, (_, i) => `tag${i}`);
      const learning = new Learning('Test', manyTags);

      expect(learning.tags).toEqual(manyTags);
      expect(learning.tags.length).toBe(100);
    });
  });

  // ============================================================================
  // Thought Class Tests
  // ============================================================================

  describe('Thought Class', () => {

    test('should create thought with content and tags', () => {
      const thought = new Thought('Feeling motivated', ['motivation']);

      expect(thought.content).toBe('Feeling motivated');
      expect(thought.tags).toEqual(['motivation']);
      expect(thought.type).toBe('thought');
      expect(thought.id).toBeDefined();
      expect(thought.timestamp).toBeInstanceOf(Date);
    });

    test('should set type to "thought"', () => {
      const thought = new Thought('Test', []);

      expect(thought.type).toBe('thought');
    });

    test('should create thought without tags', () => {
      const thought = new Thought('Random thought', []);

      expect(thought.tags).toEqual([]);
    });

    test('should handle null tags', () => {
      const thought = new Thought('Test', null);

      expect(thought.tags).toEqual([]);
    });

    test('should generate unique IDs', () => {
      const thought1 = new Thought('Thought 1', []);
      const thought2 = new Thought('Thought 2', []);

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  // ============================================================================
  // Todo Class Tests
  // ============================================================================

  describe('Todo Class', () => {

    describe('Todo Creation', () => {

      test('should create todo with title', () => {
        const todo = new Todo('Buy groceries', null, null);

        expect(todo.title).toBe('Buy groceries');
        expect(todo.dueDate).toBeNull();
        expect(todo.reminder).toBeNull();
        expect(todo.completed).toBe(false);
        expect(todo.id).toBeDefined();
        expect(todo.createdAt).toBeInstanceOf(Date);
      });

      test('should create todo with due date and reminder', () => {
        const dueDate = new Date('2024-12-31');
        const reminder = new Date('2024-12-30');
        const todo = new Todo('Submit report', dueDate, reminder);

        expect(todo.dueDate).toEqual(dueDate);
        expect(todo.reminder).toEqual(reminder);
      });

      test('should initialize as not completed', () => {
        const todo = new Todo('Test', null, null);

        expect(todo.completed).toBe(false);
      });

      test('should set createdAt to current time', () => {
        const before = Date.now();
        const todo = new Todo('Test', null, null);
        const after = Date.now();

        const createdTime = new Date(todo.createdAt).getTime();
        expect(createdTime).toBeGreaterThanOrEqual(before);
        expect(createdTime).toBeLessThanOrEqual(after);
      });

      test('should generate unique IDs', () => {
        const todo1 = new Todo('Todo 1', null, null);
        const todo2 = new Todo('Todo 2', null, null);

        expect(todo1.id).not.toBe(todo2.id);
      });

      test('should handle empty title', () => {
        const todo = new Todo('', null, null);

        expect(todo.title).toBe('');
      });
    });

    describe('Todo Toggle', () => {

      test('should toggle completion status', () => {
        const todo = new Todo('Test', null, null);

        expect(todo.completed).toBe(false);

        todo.toggleComplete();
        expect(todo.completed).toBe(true);

        todo.toggleComplete();
        expect(todo.completed).toBe(false);
      });

      test('should toggle multiple times', () => {
        const todo = new Todo('Test', null, null);

        for (let i = 0; i < 10; i++) {
          todo.toggleComplete();
          expect(todo.completed).toBe(i % 2 === 0);
        }
      });
    });
  });
});
