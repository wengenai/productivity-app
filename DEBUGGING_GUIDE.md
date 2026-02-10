# Debugging Guide for Activity Tracker

## Issues Reported
1. Countdown timer not showing when logging a new activity
2. Completed activities not showing up in summary

## Debugging Steps

### Step 1: Check Console Logs

1. Open the app: http://localhost:8000/public/index.html
2. Open browser console (Right-click → Inspect → Console tab)
3. Clear console and try to create a new activity

### Step 2: Expected Console Output

When you create an activity, you should see:

```
Starting activity: [activity name] [duration]
Activity created and saved: {object}
```

When the current activity screen shows:

```
Checking current activity: {object}
Start time: [date]
Planned end: [date]
Now: [date]
Activity in progress, showing current activity and starting timer
Starting activity timer
Timer update - remaining: [milliseconds]
Setting timer HTML: [HTML string]
Timer started, interval ID: [number]
```

### Step 3: Check Timer Display

After starting an activity:
1. Look for the "Current Activity" card
2. Verify it shows:
   - Activity name
   - Category with icon
   - Planned duration
   - **Countdown timer** (should update every second)

### Step 4: Complete an Activity

1. Wait for timer or click "Complete Activity"
2. Fill in the completion modal
3. Click "Save"

Expected console output:
```
Completing activity...
Actual activity: [what you entered]
Notes: [your notes]
Activity after completion: {object with completed: true}
Total activities after adding: [number]
Activities saved to localStorage
Current activity cleared from localStorage
```

### Step 5: Check Summary View

1. Click "Summary" tab
2. Check console for:
```
Rendering summary for period: daily
Total activities: [number]
Date range: {start, end}
Activity: [name] Date: [date] In range: true/false
Filtered activities: [number]
```

## Common Issues & Fixes

### Issue: Timer not showing
**Possible causes:**
- CSS `.hidden` class not removed from `#currentActivitySection`
- JavaScript error preventing timer start
- Timer element not found

**Check:**
- Inspect element `#currentActivitySection` - should NOT have class "hidden"
- Inspect element `#activityTimer` - should contain timer HTML
- Check console for JavaScript errors

### Issue: Activities not in summary
**Possible causes:**
- Activity not completed properly
- Date filtering issue
- LocalStorage not saving

**Check:**
- Open Application tab in DevTools → LocalStorage
- Look for key `activityTracker_activities`
- Verify JSON contains your completed activities
- Check if activity `startTime` matches the date range filter

## Manual LocalStorage Check

In browser console, run:
```javascript
// Check what's in localStorage
console.log('Current activity:', localStorage.getItem('activityTracker_currentActivity'));
console.log('All activities:', localStorage.getItem('activityTracker_activities'));

// Parse and inspect
const activities = JSON.parse(localStorage.getItem('activityTracker_activities') || '[]');
console.log('Activities count:', activities.length);
console.log('Activities:', activities);
```

## Quick Fix: Clear LocalStorage

If data seems corrupted:
```javascript
localStorage.clear();
location.reload();
```

## Additional Diagnostics

### Test Activity Creation
```javascript
// In console
const testActivity = {
    id: Date.now(),
    name: "Test Activity",
    category: "study",
    plannedDuration: 30,
    startTime: new Date().toISOString(),
    completed: true,
    actualDuration: 25,
    actualActivity: "Studied React",
    notes: "Great session"
};

const activities = JSON.parse(localStorage.getItem('activityTracker_activities') || '[]');
activities.push(testActivity);
localStorage.setItem('activityTracker_activities', JSON.stringify(activities));
location.reload();
```

### Test Current Activity Timer
```javascript
// In console
const currentActivity = {
    id: Date.now(),
    name: "Test Timer",
    category: "study",
    plannedDuration: 5,  // 5 minutes
    startTime: new Date().toISOString()
};

localStorage.setItem('activityTracker_currentActivity', JSON.stringify(currentActivity));
location.reload();
// Should see timer counting down from 5 minutes
```

## Next Steps

After running these tests, note:
1. Which console messages appear
2. Which don't appear
3. Any error messages
4. What you see in LocalStorage

This will pinpoint the exact location of the bug.
