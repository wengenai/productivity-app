// Test Helper Functions

/**
 * Create a mock Activity object
 */
export const createMockActivity = (overrides = {}) => ({
  id: Date.now() + Math.random(),
  name: 'Test Activity',
  category: 'study',
  plannedDuration: 60,
  startTime: new Date(),
  endTime: null,
  actualDuration: null,
  completed: false,
  actualActivity: null,
  notes: '',
  ...overrides
});

/**
 * Create a completed mock Activity
 */
export const createCompletedActivity = (overrides = {}) => {
  const startTime = new Date('2024-01-15T10:00:00');
  const endTime = new Date('2024-01-15T11:00:00');

  return {
    id: Date.now() + Math.random(),
    name: 'Completed Activity',
    category: 'study',
    plannedDuration: 60,
    startTime,
    endTime,
    actualDuration: 60,
    completed: true,
    actualActivity: 'Studied React',
    notes: 'Great session',
    ...overrides
  };
};

/**
 * Create a mock Learning entry
 */
export const createMockLearning = (overrides = {}) => ({
  id: Date.now() + Math.random(),
  content: 'Test learning content',
  tags: ['test', 'learning'],
  timestamp: new Date(),
  type: 'learning',
  ...overrides
});

/**
 * Create a mock Thought entry
 */
export const createMockThought = (overrides = {}) => ({
  id: Date.now() + Math.random(),
  content: 'Test thought content',
  tags: ['test', 'thought'],
  timestamp: new Date(),
  type: 'thought',
  ...overrides
});

/**
 * Create a mock Todo item
 */
export const createMockTodo = (overrides = {}) => ({
  id: Date.now() + Math.random(),
  title: 'Test Todo',
  dueDate: null,
  reminder: null,
  completed: false,
  createdAt: new Date(),
  ...overrides
});

/**
 * Mock localStorage with initial data
 */
export const mockLocalStorageWithData = (data = {}) => {
  const { activities = [], currentActivity = null, journal = [], todos = [] } = data;

  if (activities.length > 0) {
    localStorage.setItem('activityTracker_activities', JSON.stringify(activities));
  }

  if (currentActivity) {
    localStorage.setItem('activityTracker_currentActivity', JSON.stringify(currentActivity));
  }

  if (journal.length > 0) {
    localStorage.setItem('activityTracker_journal', JSON.stringify(journal));
  }

  if (todos.length > 0) {
    localStorage.setItem('activityTracker_todos', JSON.stringify(todos));
  }
};

/**
 * Clear all localStorage data
 */
export const clearMockLocalStorage = () => {
  localStorage.clear();
};

/**
 * Create a fixed date for testing
 */
export const createFixedDate = (dateString = '2024-01-15T10:00:00') => {
  return new Date(dateString);
};

/**
 * Wait for async operations
 */
export const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create multiple activities for testing
 */
export const createMultipleActivities = (count = 5) => {
  const activities = [];
  const categories = ['study', 'exercise', 'work', 'meal', 'social'];

  for (let i = 0; i < count; i++) {
    activities.push(createCompletedActivity({
      name: `Activity ${i + 1}`,
      category: categories[i % categories.length],
      actualDuration: 30 + (i * 10),
      startTime: new Date(Date.now() - (i * 3600000)) // Each 1 hour apart
    }));
  }

  return activities;
};
