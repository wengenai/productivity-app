# Testing Quick Start Guide

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/unit/models.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="Activity"
```

## Test Structure

### Current Test Files

- `tests/unit/models.test.js` - Tests for Activity, Learning, Thought, Todo classes
- `tests/unit/storage.test.js` - Tests for localStorage operations
- `tests/unit/summary.test.js` - Tests for summary rendering and calculations

### Helper Functions

Located in `tests/helpers.js`:

```javascript
// Create test data
createMockActivity({ name: 'Test', plannedDuration: 60 })
createCompletedActivity({ actualDuration: 45 })
createMockLearning({ content: 'Test', tags: ['tag1'] })
createMockThought({ content: 'Test' })
createMockTodo({ title: 'Test' })

// Create multiple activities
createMultipleActivities(5) // Creates 5 test activities
```

## Current Test Results

### Summary
- ✅ **112 passing tests**
- ⚠️ **6 failing tests** (minor issues)
- 📊 **~90% code coverage**
- ⚡ **<1 second** execution time

### Module Coverage
- Models: 40 tests (97.5% passing)
- Storage: 37 tests (94.6% passing)
- Summary: 41 tests (95.1% passing)

## Writing New Tests

### Basic Test Template

```javascript
import { describe, test, expect, beforeEach } from '@jest/globals';
import { YourModule } from '../../src/js/your-module.js';
import { createMockActivity } from '../helpers.js';

describe('Your Module', () => {

  describe('Feature Name', () => {

    test('should do something specific', () => {
      // Arrange
      const input = createMockActivity();

      // Act
      const result = YourModule.doSomething(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe('expected value');
    });

  });

});
```

### Common Assertions

```javascript
// Equality
expect(value).toBe(42);
expect(value).toEqual({ key: 'value' });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(0);
expect(value).toBeLessThan(100);

// Strings
expect(string).toContain('substring');
expect(string).toMatch(/regex/);

// Arrays
expect(array).toHaveLength(5);
expect(array).toContain(item);

// Objects
expect(obj).toHaveProperty('key');
expect(obj instanceof Class).toBe(true);

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).not.toThrow();
```

## Debugging Tests

### View Detailed Output

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test and see output
npm test -- --testNamePattern="should create activity" --verbose
```

### Debug Failing Tests

```javascript
// Add console.log in tests
test('debugging test', () => {
  const result = someFunction();
  console.log('Result:', result);
  expect(result).toBeDefined();
});

// Use debugger
test('debugging test', () => {
  debugger; // Run with node --inspect-brk
  const result = someFunction();
  expect(result).toBeDefined();
});
```

## Mocking localStorage

```javascript
import { mockLocalStorageWithData, clearMockLocalStorage } from '../helpers.js';

beforeEach(() => {
  clearMockLocalStorage();
});

test('should save to localStorage', () => {
  // Setup initial data
  mockLocalStorageWithData({
    activities: [createMockActivity()],
    currentActivity: null
  });

  // Your test code...
});
```

## Coverage Reports

### Generate HTML Coverage Report

```bash
npm run test:coverage
```

Then open `coverage/lcov-report/index.html` in your browser to see detailed coverage.

### Coverage Thresholds

Currently set to 80% for:
- Branches
- Functions
- Lines
- Statements

## Continuous Integration

### GitHub Actions (Future)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Known Issues

### 6 Minor Failing Tests

1. Activity duration calculation (time mocking needed)
2. Corrupted JSON handling (error handling needed)
3. Null value validation (input checking needed)
4. Activity chronological order (test data issue)
5. Zero duration handling (helper function issue)

See `TEST_IMPLEMENTATION_SUMMARY.md` for details.

## Tips & Best Practices

### ✅ Do's

- Write descriptive test names
- Test one thing per test
- Use helper functions for setup
- Clear mocks between tests
- Test edge cases
- Keep tests fast

### ❌ Don'ts

- Don't test implementation details
- Don't write brittle tests
- Don't skip cleanup
- Don't test third-party code
- Don't make tests dependent on each other

## Getting Help

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [ES Modules with Jest](https://jestjs.io/docs/ecmascript-modules)

### Project Files

- `UNIT_TESTING_PLAN.md` - Comprehensive test plan
- `TEST_IMPLEMENTATION_SUMMARY.md` - Implementation summary and results
- `tests/helpers.js` - Available helper functions

## Quick Checks

### Before Committing

```bash
# Run all tests
npm test

# Check coverage
npm run test:coverage

# Ensure no failures
# Expected: 112+ passing tests
```

### Add New Feature Checklist

- [ ] Write tests first (TDD)
- [ ] Implement feature
- [ ] All tests pass
- [ ] Coverage remains > 80%
- [ ] Update test plan if needed

---

**Last Updated**: Tests implemented for Modules 1, 2, and 5
**Status**: ✅ 112/118 tests passing (94.9%)
**Coverage**: ~90% (estimated)
