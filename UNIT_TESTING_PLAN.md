# Unit Testing Plan - Activity Tracker

## Overview

This document outlines a comprehensive unit testing strategy for the Activity Tracker application to ensure reliability, catch bugs early, and maintain code quality.

## Testing Framework Recommendation

**Recommended Stack:**
- **Test Runner**: Jest or Vitest
- **DOM Testing**: @testing-library/dom or jsdom
- **Assertion Library**: Built-in with Jest/Vitest
- **Coverage Tool**: Built-in with Jest/Vitest

## Test Structure

```
productivity-app/
├── src/
│   ├── js/
│   │   ├── app.js
│   │   ├── models.js
│   │   ├── storage.js
│   │   ├── categorizer.js
│   │   ├── summary.js
│   │   └── utils.js
├── tests/
│   ├── unit/
│   │   ├── models.test.js
│   │   ├── storage.test.js
│   │   ├── categorizer.test.js
│   │   ├── summary.test.js
│   │   └── utils.test.js
│   ├── integration/
│   │   ├── activity-flow.test.js
│   │   ├── journal-flow.test.js
│   │   └── todo-flow.test.js
│   └── e2e/
│       └── app.test.js
├── jest.config.js
└── package.json
```

---

## 1. Models Module (`models.js`)

### 1.1 Activity Class Tests

#### Test Suite: Activity Creation
- **Test**: Should create activity with required parameters
  - Input: `new Activity('Study Math', 60)`
  - Expected: Activity object with name, plannedDuration, category, startTime, unique id

- **Test**: Should auto-categorize activity based on name
  - Input: `new Activity('Go to gym', 90)`
  - Expected: `category === 'exercise'`

- **Test**: Should set startTime to current time by default
  - Input: `new Activity('Read', 30)`
  - Expected: `startTime` is approximately `Date.now()`

- **Test**: Should allow custom startTime
  - Input: `new Activity('Meeting', 60, customDate)`
  - Expected: `startTime === customDate`

- **Test**: Should generate unique IDs for different activities
  - Input: Create two activities
  - Expected: `activity1.id !== activity2.id`

#### Test Suite: Activity Completion
- **Test**: Should complete activity with actual activity name
  - Setup: Create activity
  - Action: `activity.complete('Actually studied Physics', 'Great session')`
  - Expected:
    - `completed === true`
    - `actualActivity === 'Actually studied Physics'`
    - `notes === 'Great session'`
    - `endTime` is set
    - `actualDuration` is calculated correctly

- **Test**: Should use planned name if no actual activity provided
  - Setup: Create activity with name 'Study'
  - Action: `activity.complete('', '')`
  - Expected: `actualActivity === 'Study'`

- **Test**: Should recategorize if actual activity differs from planned
  - Setup: `new Activity('Study', 60)` (category: 'study')
  - Action: `activity.complete('Went to gym', '')`
  - Expected: `category === 'exercise'`

- **Test**: Should calculate actualDuration correctly
  - Setup: Create activity, wait or mock time passage
  - Action: Complete after X minutes
  - Expected: `actualDuration` matches time difference in minutes

#### Test Suite: Edge Cases
- **Test**: Should handle empty activity name
  - Input: `new Activity('', 30)`
  - Expected: Should not throw, category should be 'other'

- **Test**: Should handle very long activity names
  - Input: `new Activity('x'.repeat(1000), 30)`
  - Expected: Should work without errors

- **Test**: Should handle zero or negative duration
  - Input: `new Activity('Test', 0)` and `new Activity('Test', -10)`
  - Expected: Should accept values (no validation currently, note as future enhancement)

### 1.2 Learning Class Tests

#### Test Suite: Learning Creation
- **Test**: Should create learning with content and tags
  - Input: `new Learning('React hooks are powerful', ['react', 'hooks'])`
  - Expected: Learning object with content, tags, timestamp, type='learning'

- **Test**: Should create learning without tags
  - Input: `new Learning('JavaScript tip', [])`
  - Expected: `tags` is empty array

- **Test**: Should set type to 'learning'
  - Input: Any learning
  - Expected: `type === 'learning'`

- **Test**: Should set timestamp to current time
  - Input: Create learning
  - Expected: `timestamp` is approximately now

### 1.3 Thought Class Tests

#### Test Suite: Thought Creation
- **Test**: Should create thought with content and tags
  - Input: `new Thought('Feeling motivated', ['motivation'])`
  - Expected: Thought object with content, tags, timestamp, type='thought'

- **Test**: Should set type to 'thought'
  - Input: Any thought
  - Expected: `type === 'thought'`

### 1.4 Todo Class Tests

#### Test Suite: Todo Creation
- **Test**: Should create todo with title
  - Input: `new Todo('Buy groceries', null, null)`
  - Expected: Todo with title, no dueDate, no reminder

- **Test**: Should create todo with due date and reminder
  - Input: `new Todo('Submit report', new Date('2024-12-31'), new Date('2024-12-30'))`
  - Expected: Todo with dueDate and reminder set

- **Test**: Should initialize as not completed
  - Input: Any new todo
  - Expected: `completed === false`

#### Test Suite: Todo Toggle
- **Test**: Should toggle completion status
  - Setup: Create todo
  - Action: `todo.toggleComplete()`
  - Expected: `completed === true`
  - Action: `todo.toggleComplete()` again
  - Expected: `completed === false`

---

## 2. Storage Module (`storage.js`)

### 2.1 StorageManager Tests

#### Test Suite: Activities Storage
- **Test**: Should save activities to localStorage
  - Setup: Mock localStorage
  - Action: `storage.saveActivities([activity1, activity2])`
  - Expected: localStorage.setItem called with correct key and JSON string

- **Test**: Should retrieve activities from localStorage
  - Setup: Mock localStorage with activity data
  - Action: `const activities = storage.getActivities()`
  - Expected: Returns array of activities

- **Test**: Should return empty array if no activities exist
  - Setup: Empty localStorage
  - Action: `const activities = storage.getActivities()`
  - Expected: Returns `[]`

- **Test**: Should handle corrupted data gracefully
  - Setup: localStorage has invalid JSON
  - Action: `storage.getActivities()`
  - Expected: Returns `[]` or handles error

#### Test Suite: Current Activity Storage
- **Test**: Should save current activity
  - Action: `storage.saveCurrentActivity(activity)`
  - Expected: localStorage.setItem called with correct key

- **Test**: Should retrieve current activity
  - Setup: Mock localStorage with current activity
  - Action: `const current = storage.getCurrentActivity()`
  - Expected: Returns activity object

- **Test**: Should return null if no current activity
  - Setup: Empty localStorage
  - Action: `const current = storage.getCurrentActivity()`
  - Expected: Returns `null`

- **Test**: Should clear current activity
  - Setup: Current activity exists
  - Action: `storage.clearCurrentActivity()`
  - Expected: localStorage.removeItem called with correct key

#### Test Suite: Journal Storage
- **Test**: Should save journal entries
  - Action: `storage.saveJournalEntries([entry1, entry2])`
  - Expected: localStorage.setItem called correctly

- **Test**: Should retrieve journal entries
  - Setup: Mock localStorage with journal data
  - Action: `const entries = storage.getJournalEntries()`
  - Expected: Returns array of entries

#### Test Suite: Todos Storage
- **Test**: Should save todos
  - Action: `storage.saveTodos([todo1, todo2])`
  - Expected: localStorage.setItem called correctly

- **Test**: Should retrieve todos
  - Setup: Mock localStorage with todo data
  - Action: `const todos = storage.getTodos()`
  - Expected: Returns array of todos

#### Test Suite: Clear All Data
- **Test**: Should clear all app data
  - Setup: All data types in localStorage
  - Action: `storage.clearAll()`
  - Expected: All keys removed from localStorage

---

## 3. Categorizer Module (`categorizer.js`)

### 3.1 Category Detection Tests

#### Test Suite: categorizeActivity Function
- **Test**: Should categorize exercise activities
  - Inputs: 'gym', 'workout', 'running', 'yoga'
  - Expected: All return 'exercise'

- **Test**: Should categorize study activities
  - Inputs: 'study math', 'homework', 'research paper'
  - Expected: All return 'study'

- **Test**: Should categorize work activities
  - Inputs: 'work meeting', 'coding session', 'project deadline'
  - Expected: All return 'work'

- **Test**: Should categorize meal activities
  - Inputs: 'breakfast', 'lunch', 'dinner', 'cooking'
  - Expected: All return 'meal'

- **Test**: Should categorize social activities
  - Inputs: 'party', 'hangout with friends', 'date night'
  - Expected: All return 'social'

- **Test**: Should be case-insensitive
  - Inputs: 'GYM', 'Gym', 'gym'
  - Expected: All return 'exercise'

- **Test**: Should handle partial matches
  - Input: 'going to the gym later'
  - Expected: Returns 'exercise'

- **Test**: Should return 'other' for unknown activities
  - Input: 'xyzabc123'
  - Expected: Returns 'other'

- **Test**: Should return 'other' for empty string
  - Input: ''
  - Expected: Returns 'other'

- **Test**: Should return 'other' for null/undefined
  - Input: null, undefined
  - Expected: Returns 'other'

### 3.2 Category Colors Tests

#### Test Suite: getCategoryColor Function
- **Test**: Should return correct color for each category
  - Input: Each category name
  - Expected: Returns corresponding hex color code

- **Test**: Should return default color for unknown category
  - Input: 'nonexistent'
  - Expected: Returns '#adb5bd' (other color)

### 3.3 Category Icons Tests

#### Test Suite: getCategoryIcon Function
- **Test**: Should return correct emoji for each category
  - Input: Each category name
  - Expected: Returns corresponding emoji

- **Test**: Should return default icon for unknown category
  - Input: 'nonexistent'
  - Expected: Returns '📝' (other icon)

### 3.4 Get All Categories Tests

#### Test Suite: getAllCategories Function
- **Test**: Should return array of all category names
  - Action: `getAllCategories()`
  - Expected: Returns array with all category keys

---

## 4. Utils Module (`utils.js`)

### 4.1 Time Formatting Tests

#### Test Suite: formatDuration Function
- **Test**: Should format minutes only
  - Input: 45
  - Expected: '45m'

- **Test**: Should format hours only
  - Input: 120
  - Expected: '2h'

- **Test**: Should format hours and minutes
  - Input: 90
  - Expected: '1h 30m'

- **Test**: Should handle zero
  - Input: 0
  - Expected: '0m'

- **Test**: Should handle large numbers
  - Input: 1440 (24 hours)
  - Expected: '24h'

#### Test Suite: formatDate Function
- **Test**: Should format today's date as 'Today at HH:MM'
  - Input: new Date() (current time)
  - Expected: 'Today at [time]'

- **Test**: Should format yesterday's date
  - Input: Date from yesterday
  - Expected: 'Yesterday at [time]'

- **Test**: Should format tomorrow's date
  - Input: Date for tomorrow
  - Expected: 'Tomorrow at [time]'

- **Test**: Should format past dates
  - Input: Date from last week
  - Expected: 'Mon DD at HH:MM' format

- **Test**: Should format future dates
  - Input: Date next week
  - Expected: Proper formatted date

#### Test Suite: getDateRange Function
- **Test**: Should return daily range
  - Input: 'daily'
  - Expected: start is today at 00:00:00, end is today at 23:59:59

- **Test**: Should return weekly range
  - Input: 'weekly'
  - Expected: start is Sunday of current week, end is Saturday

- **Test**: Should return monthly range
  - Input: 'monthly'
  - Expected: start is 1st of month, end is last day of month

- **Test**: Should handle leap years for monthly
  - Input: 'monthly' in February of leap year
  - Expected: end is Feb 29

#### Test Suite: updateTimeRemaining Function
- **Test**: Should calculate time until bedtime (11 PM)
  - Mock current time to 8 PM
  - Expected: Returns {hours: 3, minutes: 0}

- **Test**: Should handle time after bedtime (next day)
  - Mock current time to 11:30 PM
  - Expected: Returns time until next day's 11 PM

---

## 5. Summary Module (`summary.js`)

### 5.1 Summary Rendering Tests

#### Test Suite: renderSummary Function
- **Test**: Should return empty state message for no activities
  - Input: [], 'daily'
  - Expected: HTML with "No activities recorded" message

- **Test**: Should render summary statistics
  - Input: Array of 5 activities, 'daily'
  - Expected: HTML contains total activities count, total time, average duration

- **Test**: Should calculate total time correctly
  - Input: Activities with durations [30, 45, 60]
  - Expected: Total shows 135 minutes (2h 15m)

- **Test**: Should identify most active category
  - Input: 3 study activities, 1 exercise
  - Expected: Most active category is 'study'

#### Test Suite: Category Breakdown
- **Test**: Should group activities by category
  - Input: Mixed category activities
  - Expected: Correct count per category

- **Test**: Should calculate percentage correctly
  - Input: 100 min total, 30 min study
  - Expected: Study shows 30%

- **Test**: Should sort categories by time spent
  - Input: Various categories with different durations
  - Expected: Categories sorted descending by duration

#### Test Suite: Activity Timeline
- **Test**: Should render activities in chronological order
  - Input: Activities with different timestamps
  - Expected: Most recent first

- **Test**: Should display activity details
  - Input: Activity with all fields filled
  - Expected: Shows name, category, duration, notes

---

## 6. Integration Tests

### 6.1 Activity Flow Tests

#### Test Suite: Complete Activity Workflow
- **Test**: Should create, start, and complete an activity
  - Action: Create activity → Start → Complete
  - Expected: Activity saved to localStorage with all data

- **Test**: Should restore in-progress activity on page reload
  - Action: Start activity → Reload page
  - Expected: Current activity restored, timer continues

- **Test**: Should show completed activities in summary
  - Action: Complete 3 activities today
  - Expected: Daily summary shows all 3

### 6.2 Journal Flow Tests

#### Test Suite: Journal Entry Management
- **Test**: Should create and save journal entry
  - Action: Create learning entry with tags
  - Expected: Entry saved and appears in journal list

- **Test**: Should filter entries by tag
  - Action: Create entries with different tags → Filter
  - Expected: Only matching entries shown

### 6.3 Todo Flow Tests

#### Test Suite: Todo Management
- **Test**: Should create and toggle todo
  - Action: Create todo → Toggle complete
  - Expected: Todo marked as complete in UI and storage

- **Test**: Should delete todo
  - Action: Create todo → Delete
  - Expected: Todo removed from storage and UI

---

## 7. End-to-End Tests

### 7.1 Full Application Tests

#### Test Suite: User Journey
- **Test**: Complete user session
  - Navigate to app
  - Create activity
  - Wait for timer
  - Complete activity
  - View in summary
  - Expected: All data persists and displays correctly

---

## 8. Test Coverage Goals

### Minimum Coverage Targets
- **Unit Tests**: 80% code coverage
- **Integration Tests**: Cover all critical user flows
- **E2E Tests**: Cover happy path scenarios

### Critical Paths (100% Coverage Required)
- Activity completion flow
- Data persistence (localStorage operations)
- Timer functionality
- Date/time calculations

---

## 9. Mock Strategy

### Items to Mock
1. **localStorage**: Mock all localStorage operations
2. **Date/Time**: Mock `Date.now()` and `new Date()` for consistent tests
3. **DOM Elements**: Use jsdom or @testing-library
4. **Timers**: Mock `setInterval`, `setTimeout` with Jest timers

### Example Mock Setup
```javascript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock Date
const mockDate = new Date('2024-01-15T10:00:00');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
```

---

## 10. Test Execution Plan

### Setup Commands
```bash
# Install dependencies
npm install --save-dev jest @testing-library/dom @testing-library/jest-dom

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test models.test.js

# Watch mode
npm test -- --watch
```

### CI/CD Integration
- Run tests on every commit
- Require 80% coverage to merge
- Run E2E tests before deployment

---

## 11. Known Issues to Test

Based on the bug fixes applied:

1. **LocalStorage Object Deserialization**
   - Test: Verify objects from localStorage don't have class methods
   - Fix: Ensure manual property assignment works

2. **Browser Caching**
   - Test: Verify cache-busting query parameters work
   - Fix: Ensure versioned asset loading

3. **Timer Persistence**
   - Test: Verify timer restores correctly after page reload
   - Fix: Ensure startTime deserializes correctly

4. **Modal Not Closing**
   - Test: Verify modal closes after activity completion
   - Fix: Ensure no errors prevent completion flow

---

## 12. Future Enhancements to Test

When adding new features, add tests for:
- Export to CSV/JSON functionality
- Data import
- Cloud sync
- Pomodoro timer
- Goal tracking
- Charts and visualizations

---

## 13. Test Utilities

### Helper Functions to Create
```javascript
// tests/helpers.js
export const createMockActivity = (overrides = {}) => ({
  id: Date.now(),
  name: 'Test Activity',
  category: 'study',
  plannedDuration: 60,
  startTime: new Date(),
  completed: false,
  ...overrides
});

export const createMockStorage = () => ({
  activities: [],
  currentActivity: null,
  journal: [],
  todos: []
});

export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); }
  };
};
```

---

## 14. Documentation

### For Each Test File Include
- Description of what's being tested
- Setup instructions
- Teardown/cleanup
- Known limitations
- Related bug tickets

---

## Summary

This testing plan provides comprehensive coverage for:
- ✅ All data models
- ✅ Storage operations
- ✅ Business logic (categorization, calculations)
- ✅ UI rendering
- ✅ Integration flows
- ✅ End-to-end scenarios

**Next Steps:**
1. Set up testing framework (Jest/Vitest)
2. Create test directory structure
3. Implement unit tests for models
4. Add integration tests
5. Set up CI/CD pipeline
6. Achieve 80% code coverage
7. Document all tests

**Estimated Implementation Time:**
- Setup: 2-4 hours
- Unit tests: 8-12 hours
- Integration tests: 4-6 hours
- E2E tests: 4-6 hours
- Documentation: 2-3 hours

**Total: ~20-30 hours** for comprehensive test coverage
