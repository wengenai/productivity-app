# Activity Tracker - Productivity App

A comprehensive time tracking and productivity application that helps you log activities, manage your time, journal learnings, and stay organized with reminders.

## Features

### Activity Tracking
- **Time Remaining Display**: Shows hours remaining until bedtime (11 PM)
- **Activity Planning**: Plan what you want to do next and for how long
- **Live Timer**: Real-time countdown during activities
- **Activity Completion**: Log what you actually did vs. what you planned
- **Activity Categories**: Gym, studying, reading, meals, classes, work, and more

### Analytics & Insights
- **Daily Summary**: View today's activities and time breakdown
- **Weekly Summary**: See patterns over the past week
- **Monthly Summary**: Comprehensive monthly activity analysis
- **Category Breakdown**: Visual charts showing time spent per category
- **Activity Timeline**: Chronological view of all your activities

### Journal & Learnings
- **Learnings**: Record things you've learned
- **Thoughts**: Capture your thoughts and reflections
- **Tagging System**: Tag entries for easy organization
- **Filter by Tags**: View all entries with specific tags

### To-Do List & Reminders
- **Task Management**: Create and manage to-do items
- **Due Dates**: Set deadlines for tasks
- **Reminders**: Get browser notifications for upcoming tasks
- **Completion Tracking**: Mark tasks as done

## Getting Started

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd productivity-app
   ```

### Running the App

Simply open the HTML file in your browser:

```bash
# On macOS
open public/index.html

# On Linux
xdg-open public/index.html

# On Windows
start public/index.html
```

Or use the npm script:
```bash
npm start
```

### File Structure

```
productivity-app/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── css/
│   │   └── styles.css      # All styling
│   └── js/
│       ├── app.js          # Main application logic
│       ├── models.js       # Data models (Activity, Learning, Todo)
│       ├── storage.js      # Local storage management
│       ├── summary.js      # Analytics and summary rendering
│       └── utils.js        # Utility functions
├── package.json
└── README.md
```

## How to Use

### Tracking an Activity

1. The home screen shows how much time you have until bedtime (11 PM)
2. Enter what you want to do next (e.g., "Study Math")
3. Select a category (e.g., "studying")
4. Set the duration in minutes (e.g., "60")
5. Click "Start Activity"
6. A live timer will count down your activity
7. When time is up (or you click "Complete Activity"), you'll be asked:
   - What you actually did
   - Any notes or reflections

### Recording Learnings or Thoughts

1. Navigate to the "Journal" tab
2. Select whether it's a "Learning" or a "Thought"
3. Write your content
4. Add tags (comma-separated) for organization
5. Click "Save"
6. Use tag filters to view entries by topic

### Managing To-Dos

1. Navigate to the "To-Do List" tab
2. Enter a task title
3. Optionally set a due date and reminder time
4. Click "Add To-Do"
5. Check off tasks as you complete them
6. You'll receive browser notifications for reminders

### Viewing Summaries

1. Navigate to the "Summary" tab
2. Choose between Daily, Weekly, or Monthly views
3. See:
   - Total activities and time spent
   - Average activity duration
   - Most active category
   - Time breakdown by category (charts and tables)
   - Activity timeline

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- Your data stays on your device
- No internet connection required
- Data persists between sessions
- Clearing browser data will delete your activity history

## Customization

### Changing Bedtime

Edit the bedtime in `src/js/app.js` and `src/js/utils.js`:
```javascript
bedtime.setHours(23, 0, 0, 0); // Change 23 to your preferred hour
```

### Adding Categories

Edit the `CATEGORIES` array in `src/js/models.js`:
```javascript
export const CATEGORIES = [
    'gym',
    'studying',
    'reading',
    // Add your custom categories here
];
```

### Styling

Customize colors and appearance in `src/css/styles.css`. The app uses CSS variables for the gradient theme:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires JavaScript enabled and localStorage support.

## Tips for Best Results

1. **Be Consistent**: Log activities regularly to get meaningful insights
2. **Use Tags**: Tag your learnings and thoughts to build a searchable knowledge base
3. **Review Summaries**: Check weekly/monthly summaries to identify patterns
4. **Set Realistic Durations**: This helps with time management
5. **Add Notes**: Include details about what you learned or accomplished

## Future Enhancements

Potential features to add:
- Export data to CSV/JSON
- Data visualization charts
- Goal setting and tracking
- Pomodoro timer integration
- Cloud sync across devices
- Mobile app version

## License

MIT License - feel free to modify and use as you wish!
