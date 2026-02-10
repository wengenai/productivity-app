# AI Categorization Testing Checklist

## Prerequisites
- App is open in browser (index.html)
- Browser console is open (F12 or Cmd+Option+I)

## Test 1: Keywords Only Mode (No API Key)

### Steps:
1. Navigate to "⚙️ Settings"
2. Leave API key field empty
3. Select "Keywords Only (Free)"
4. Click "Save Settings"
5. Navigate to "Track Activity"
6. Test these activities:

| Activity Input | Expected Category | Reason |
|---------------|-------------------|---------|
| "going to gym" | exercise | Keyword match: "gym" |
| "study math" | study | Keyword match: "study" |
| "read book" | reading | Keyword match: "read" |
| "getting fit" | other | No keyword match |
| "team lunch" | meal | Keyword match: "lunch" |

### ✓ Pass Criteria:
- All categorizations happen instantly (no AI calls)
- Console shows no "Categorizing with AI" messages
- Categories match expectations

---

## Test 2: Hybrid Mode (With API Key)

### Steps:
1. Navigate to "⚙️ Settings"
2. Enter your Anthropic API key (starts with `sk-ant-...`)
3. Select "Hybrid (Recommended)"
4. Click "Save Settings"
5. Check cache stats shows "No cached categorizations yet"
6. Navigate to "Track Activity"
7. Test these activities:

| Activity Input | Expected Behavior |
|---------------|-------------------|
| "going to gym" | Uses keyword → "exercise" (no AI call) |
| "getting fit" | Keywords fail → AI call → "exercise" |
| "preparing presentation" | Keywords fail → AI call → "work" |
| "coffee with client" | Keywords fail → AI call → "social" or "work" |
| "getting fit" (again) | Uses cache → "exercise" (no new AI call) |

### ✓ Pass Criteria:
- Activities with clear keywords use keywords (fast)
- Ambiguous activities trigger AI (console shows "Categorizing with AI")
- Second "getting fit" uses cache (console shows "Using cached AI categorization")
- Cache stats update correctly

---

## Test 3: Always AI Mode

### Steps:
1. Navigate to "⚙️ Settings"
2. Ensure API key is still set
3. Select "Always AI"
4. Click "Save Settings"
5. Clear AI cache (optional - to see fresh calls)
6. Navigate to "Track Activity"
7. Test:

| Activity Input | Expected Behavior |
|---------------|-------------------|
| "going to gym" | AI call even though keyword exists |
| Any activity | Every activity uses AI unless cached |

### ✓ Pass Criteria:
- All activities trigger AI categorization
- Console shows "Categorizing with AI" for new activities
- Categories are intelligent and context-aware

---

## Test 4: Settings UI

### Steps:
1. Navigate to "⚙️ Settings"
2. Verify API key field shows masked value (•••••)
3. Change categorization mode
4. Click "Save Settings" → Should show success alert
5. Refresh page
6. Navigate back to "⚙️ Settings"

### ✓ Pass Criteria:
- Settings persist after page refresh
- Cache statistics display correctly
- "Clear AI Cache" button works (stats reset to 0)

---

## Test 5: Activity Completion with AI

### Steps:
1. Ensure AI is enabled (Hybrid or Always mode)
2. Create activity: "getting ready for meeting"
3. Let it complete
4. In completion modal, change actual activity to "prepared slides"
5. Complete the activity
6. Check the category

### ✓ Pass Criteria:
- Activity gets re-categorized based on actual activity name
- Uses AI if enabled and ambiguous

---

## Test 6: Error Handling

### Steps:
1. Navigate to "⚙️ Settings"
2. Enter invalid API key: "sk-ant-invalid123"
3. Select "Always AI"
4. Click "Save Settings"
5. Navigate to "Track Activity"
6. Create activity: "testing error handling"
7. Check console

### ✓ Pass Criteria:
- Console shows API error (401 or 403)
- App falls back to keyword categorization
- No crashes or blank screens

---

## Test 7: Cache Management

### Steps:
1. With valid API key in Hybrid mode
2. Create 5 ambiguous activities (triggers AI)
3. Navigate to "⚙️ Settings"
4. Check cache stats (should show 5 entries, ~$0.0012)
5. Click "Clear AI Cache"
6. Verify stats reset

### ✓ Pass Criteria:
- Cache stats accurately reflect number of cached items
- Cost estimation is reasonable (~$0.00025 per item)
- Clear cache works correctly

---

## Test 8: Data Persistence

### Steps:
1. Set API key and mode
2. Create some activities
3. Close browser tab
4. Reopen index.html
5. Navigate to Settings

### ✓ Pass Criteria:
- API key is still set (masked)
- Categorization mode is saved
- Activities are preserved
- Cache is preserved

---

## Test 9: Clear All Data

### Steps:
1. With activities, settings configured
2. Navigate to "⚙️ Settings"
3. Click "Clear All App Data"
4. Confirm the dialog

### ✓ Pass Criteria:
- Confirmation dialog appears
- Page reloads after confirmation
- All activities cleared
- Settings reset to defaults
- Cache cleared

---

## Performance Benchmarks

### Expected Timing:
- **Keyword categorization**: < 1ms
- **AI categorization (first call)**: 500-2000ms
- **AI categorization (cached)**: < 5ms

### Cost Estimates:
- **Hybrid mode**: ~$0.05 per 1000 activities
- **Always AI mode**: ~$0.25 per 1000 activities

---

## Console Log Examples

### Good Signs:
```
✓ Activity created and saved: {...}
✓ Keyword match inconclusive, trying AI for: getting fit
✓ Categorizing with AI: getting fit
✓ AI categorization: getting fit → exercise
✓ Using cached AI categorization for: getting fit → exercise
✓ Category refined: other → exercise
```

### Warning Signs (Non-Critical):
```
⚠ No Anthropic API key configured
⚠ AI returned invalid category: <category>
```

### Error Signs (Needs Investigation):
```
❌ Anthropic API error: 401 <error details>
❌ Failed to categorize with AI: <error>
❌ Uncaught TypeError: ...
```

---

## Summary

✅ Complete all 9 tests above
✅ Verify all pass criteria are met
✅ Check console for any unexpected errors
✅ Confirm app is production-ready

The hybrid AI categorization system should now be fully functional! 🎉
