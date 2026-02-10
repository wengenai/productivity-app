import { describe, test, expect, beforeEach } from '@jest/globals';
import { renderSummary } from '../../src/js/summary.js';
import { createCompletedActivity, createMultipleActivities } from '../helpers.js';

describe('Summary Module', () => {

  // ============================================================================
  // renderSummary Function Tests
  // ============================================================================

  describe('renderSummary Function', () => {

    describe('Empty State', () => {

      test('should return empty state message for no activities', () => {
        const html = renderSummary([], 'daily');

        expect(html).toContain('No activities recorded');
        expect(html).toBeDefined();
        expect(typeof html).toBe('string');
      });

      test('should handle weekly period with no activities', () => {
        const html = renderSummary([], 'weekly');

        expect(html).toContain('No activities recorded');
      });

      test('should handle monthly period with no activities', () => {
        const html = renderSummary([], 'monthly');

        expect(html).toContain('No activities recorded');
      });
    });

    describe('Summary Statistics', () => {

      test('should render total activities count', () => {
        const activities = createMultipleActivities(5);
        const html = renderSummary(activities, 'daily');

        expect(html).toContain('Total Activities');
        expect(html).toContain('5');
      });

      test('should calculate total time correctly', () => {
        const activities = [
          createCompletedActivity({ actualDuration: 30 }),
          createCompletedActivity({ actualDuration: 45 }),
          createCompletedActivity({ actualDuration: 60 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('Total Time');
        // Total: 135 minutes = 2h 15m
        expect(html).toContain('2h 15m');
      });

      test('should calculate average duration correctly', () => {
        const activities = [
          createCompletedActivity({ actualDuration: 30 }),
          createCompletedActivity({ actualDuration: 60 }),
          createCompletedActivity({ actualDuration: 90 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('Average Duration');
        // Average: (30 + 60 + 90) / 3 = 60 minutes = 1h
        expect(html).toContain('1h');
      });

      test('should identify most active category', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 60 }),
          createCompletedActivity({ category: 'study', actualDuration: 60 }),
          createCompletedActivity({ category: 'study', actualDuration: 60 }),
          createCompletedActivity({ category: 'exercise', actualDuration: 30 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('Most Active Category');
        expect(html).toContain('study');
      });

      test('should handle single activity', () => {
        const activities = [
          createCompletedActivity({ actualDuration: 45 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('1'); // Total activities
        expect(html).toContain('45m'); // Total time and average
      });

      test('should use plannedDuration if actualDuration is not available', () => {
        const activities = [
          createCompletedActivity({ plannedDuration: 60, actualDuration: null })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('1h');
      });
    });

    describe('Category Breakdown', () => {

      test('should group activities by category', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 60 }),
          createCompletedActivity({ category: 'exercise', actualDuration: 30 }),
          createCompletedActivity({ category: 'work', actualDuration: 45 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('study');
        expect(html).toContain('exercise');
        expect(html).toContain('work');
      });

      test('should calculate category counts correctly', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 30 }),
          createCompletedActivity({ category: 'study', actualDuration: 30 }),
          createCompletedActivity({ category: 'exercise', actualDuration: 30 })
        ];

        const html = renderSummary(activities, 'daily');

        // Should show 2 study activities and 1 exercise
        expect(html).toMatch(/study.*2/s);
        expect(html).toMatch(/exercise.*1/s);
      });

      test('should calculate category time totals correctly', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 30 }),
          createCompletedActivity({ category: 'study', actualDuration: 45 }),
          createCompletedActivity({ category: 'exercise', actualDuration: 60 })
        ];

        const html = renderSummary(activities, 'daily');

        // Study: 30 + 45 = 75 minutes = 1h 15m
        expect(html).toContain('1h 15m');
        // Exercise: 60 minutes = 1h
        expect(html).toContain('1h');
      });

      test('should calculate percentages correctly', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 60 }),
          createCompletedActivity({ category: 'exercise', actualDuration: 40 })
        ];

        const html = renderSummary(activities, 'daily');

        // Total: 100 minutes
        // Study: 60/100 = 60%
        // Exercise: 40/100 = 40%
        expect(html).toContain('60.0%');
        expect(html).toContain('40.0%');
      });

      test('should sort categories by time spent (descending)', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 90 }),
          createCompletedActivity({ category: 'exercise', actualDuration: 30 }),
          createCompletedActivity({ category: 'work', actualDuration: 60 })
        ];

        const html = renderSummary(activities, 'daily');

        // Study should appear before work, work before exercise
        const studyIndex = html.indexOf('study');
        const workIndex = html.indexOf('work');
        const exerciseIndex = html.indexOf('exercise');

        expect(studyIndex).toBeLessThan(workIndex);
        expect(workIndex).toBeLessThan(exerciseIndex);
      });

      test('should display category icons', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 60 }),
          createCompletedActivity({ category: 'exercise', actualDuration: 30 })
        ];

        const html = renderSummary(activities, 'daily');

        // Check for emoji icons (these are from categorizer.js)
        expect(html).toContain('📚'); // study icon
        expect(html).toContain('💪'); // exercise icon
      });

      test('should display category colors', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 60 })
        ];

        const html = renderSummary(activities, 'daily');

        // Check for color styling
        expect(html).toContain('background');
        expect(html).toContain('#667eea'); // study color
      });

      test('should handle multiple activities in same category', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 20 }),
          createCompletedActivity({ category: 'study', actualDuration: 20 }),
          createCompletedActivity({ category: 'study', actualDuration: 20 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('study');
        // Should aggregate to 60 minutes total
        expect(html).toContain('1h');
      });

      test('should calculate average time per category', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 30 }),
          createCompletedActivity({ category: 'study', actualDuration: 90 })
        ];

        const html = renderSummary(activities, 'daily');

        // Average for study: (30 + 90) / 2 = 60 minutes
        expect(html).toContain('1h');
      });
    });

    describe('Activity Timeline', () => {

      test('should render activities in chronological order (most recent first)', () => {
        const now = new Date();
        const activities = [
          createCompletedActivity({
            name: 'Oldest',
            actualActivity: 'Oldest',
            startTime: new Date(now.getTime() - 7200000) // 2 hours ago
          }),
          createCompletedActivity({
            name: 'Middle',
            actualActivity: 'Middle',
            startTime: new Date(now.getTime() - 3600000) // 1 hour ago
          }),
          createCompletedActivity({
            name: 'Newest',
            actualActivity: 'Newest',
            startTime: new Date(now.getTime() - 1800000) // 30 min ago
          })
        ];

        const html = renderSummary(activities, 'daily');

        const newestIndex = html.indexOf('Newest');
        const middleIndex = html.indexOf('Middle');
        const oldestIndex = html.indexOf('Oldest');

        expect(newestIndex).toBeGreaterThan(-1); // Verify all are found
        expect(middleIndex).toBeGreaterThan(-1);
        expect(oldestIndex).toBeGreaterThan(-1);
        expect(newestIndex).toBeLessThan(middleIndex);
        expect(middleIndex).toBeLessThan(oldestIndex);
      });

      test('should display activity names', () => {
        const activities = [
          createCompletedActivity({ actualActivity: 'Studied React' }),
          createCompletedActivity({ actualActivity: 'Went to gym' })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('Studied React');
        expect(html).toContain('Went to gym');
      });

      test('should use activity name if actualActivity is not set', () => {
        const activities = [
          createCompletedActivity({ name: 'Study', actualActivity: null })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('Study');
      });

      test('should display activity categories in timeline', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 60 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('study');
      });

      test('should display activity durations', () => {
        const activities = [
          createCompletedActivity({ actualDuration: 45 }),
          createCompletedActivity({ actualDuration: 120 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('45m');
        expect(html).toContain('2h');
      });

      test('should display activity notes if present', () => {
        const activities = [
          createCompletedActivity({ notes: 'Great session!' })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('Great session!');
      });

      test('should not display notes section if notes are empty', () => {
        const activities = [
          createCompletedActivity({ notes: '' })
        ];

        const html = renderSummary(activities, 'daily');

        // Should not have empty notes section
        const notesCount = (html.match(/timeline-notes/g) || []).length;
        expect(notesCount).toBe(0);
      });

      test('should format timestamps correctly', () => {
        const activities = [
          createCompletedActivity({
            startTime: new Date('2024-01-15T14:30:00')
          })
        ];

        const html = renderSummary(activities, 'daily');

        // Should contain formatted time (exact format depends on implementation)
        expect(html).toMatch(/\d{1,2}:\d{2}/); // Should have time like 2:30 or 14:30
      });
    });

    describe('Edge Cases', () => {

      test('should handle activities with zero duration', () => {
        const activities = [
          {
            id: Date.now(),
            name: 'Zero Duration Activity',
            category: 'study',
            plannedDuration: 0,
            startTime: new Date(),
            endTime: new Date(),
            actualDuration: 0,
            completed: true,
            actualActivity: 'Zero Duration Activity',
            notes: ''
          }
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('0m');
      });

      test('should handle very long activity names', () => {
        const longName = 'x'.repeat(500);
        const activities = [
          createCompletedActivity({ actualActivity: longName })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain(longName);
      });

      test('should handle special characters in activity names', () => {
        const activities = [
          createCompletedActivity({
            actualActivity: 'Study <html> & "JavaScript"'
          })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('Study');
        expect(html).toContain('JavaScript');
      });

      test('should handle very large duration values', () => {
        const activities = [
          createCompletedActivity({ actualDuration: 10000 }) // Over 166 hours
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('166h');
      });

      test('should handle mixed completed and incomplete activities', () => {
        const activities = [
          createCompletedActivity({ actualDuration: 60, completed: true }),
          createCompletedActivity({ plannedDuration: 30, actualDuration: null, completed: false })
        ];

        const html = renderSummary(activities, 'daily');

        // Should handle both types
        expect(html).toBeDefined();
      });

      test('should handle all same category', () => {
        const activities = [
          createCompletedActivity({ category: 'study', actualDuration: 30 }),
          createCompletedActivity({ category: 'study', actualDuration: 40 }),
          createCompletedActivity({ category: 'study', actualDuration: 50 })
        ];

        const html = renderSummary(activities, 'daily');

        expect(html).toContain('study');
        expect(html).toContain('100.0%'); // Only one category = 100%
      });

      test('should handle many different categories', () => {
        const categories = ['study', 'exercise', 'work', 'meal', 'social', 'reading', 'hobby'];
        const activities = categories.map(cat =>
          createCompletedActivity({ category: cat, actualDuration: 30 })
        );

        const html = renderSummary(activities, 'daily');

        categories.forEach(cat => {
          expect(html).toContain(cat);
        });
      });
    });

    describe('Period Parameter', () => {

      test('should accept daily period', () => {
        const activities = createMultipleActivities(3);
        expect(() => renderSummary(activities, 'daily')).not.toThrow();
      });

      test('should accept weekly period', () => {
        const activities = createMultipleActivities(3);
        expect(() => renderSummary(activities, 'weekly')).not.toThrow();
      });

      test('should accept monthly period', () => {
        const activities = createMultipleActivities(3);
        expect(() => renderSummary(activities, 'monthly')).not.toThrow();
      });

      test('should render consistent output regardless of period parameter', () => {
        const activities = createMultipleActivities(3);

        const dailyHtml = renderSummary(activities, 'daily');
        const weeklyHtml = renderSummary(activities, 'weekly');
        const monthlyHtml = renderSummary(activities, 'monthly');

        // All should contain same activity count
        [dailyHtml, weeklyHtml, monthlyHtml].forEach(html => {
          expect(html).toContain('3');
        });
      });
    });

    describe('HTML Structure', () => {

      test('should return valid HTML string', () => {
        const activities = createMultipleActivities(2);
        const html = renderSummary(activities, 'daily');

        expect(typeof html).toBe('string');
        expect(html.length).toBeGreaterThan(0);
      });

      test('should contain summary statistics section', () => {
        const activities = createMultipleActivities(3);
        const html = renderSummary(activities, 'daily');

        expect(html).toContain('summary-stats');
      });

      test('should contain category breakdown section', () => {
        const activities = createMultipleActivities(3);
        const html = renderSummary(activities, 'daily');

        expect(html).toContain('category-breakdown');
      });

      test('should contain activity timeline section', () => {
        const activities = createMultipleActivities(3);
        const html = renderSummary(activities, 'daily');

        expect(html).toContain('recent-activities');
      });

      test('should contain stat cards', () => {
        const activities = createMultipleActivities(2);
        const html = renderSummary(activities, 'daily');

        expect(html).toContain('stat-card');
      });
    });
  });
});
