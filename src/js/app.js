import { Activity, Learning, Thought, Todo } from './models.js';
import { StorageManager } from './storage.js';
import { updateTimeRemaining, formatDuration, formatDate, getDateRange, getDateBanner, isSameDay, parseDuration } from './utils.js';
import { renderSummary } from './summary.js';
import { getCategoryColor, getCategoryIcon, categorizeActivity, categorizeActivitySync } from './categorizer.js';
import { config } from './config.js';
import { aiCategorizer } from './ai-categorizer.js';
import { journalCategorizer } from './journal-categorizer.js';

class ActivityTrackerApp {
    constructor() {
        try {
            this.storage = new StorageManager();
            this.activities = this.storage.getActivities();
            this.journalEntries = this.storage.getJournalEntries();
            this.todos = this.storage.getTodos();
            this.currentActivity = this.storage.getCurrentActivity();
            this.currentTimer = null;
            this.reminderCheckInterval = null;
            this.currentJournalType = 'thought'; // Default type for journal entries
            this.currentCompletionJournalType = 'thought'; // For completion modal

            console.log('App initialized successfully');
            console.log('Current activity:', this.currentActivity);
            console.log('Activities count:', this.activities.length);

            this.init();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            throw error;
        }
    }

    init() {
        this.setupEventListeners();
        this.renderTimeRemaining();
        this.checkCurrentActivity();
        this.renderActivityHistory();
        this.renderJournalEntries();
        this.renderTodos();
        this.startReminderCheck();

        // Update time remaining every minute
        setInterval(() => this.renderTimeRemaining(), 60000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Activity form
        document.getElementById('activityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startActivity();
        });

        // Complete activity button
        document.getElementById('completeActivityBtn').addEventListener('click', () => {
            this.showCompletionModal();
        });

        // Completion form
        document.getElementById('completionForm').addEventListener('submit', (e) => {
            console.log('Completion form submitted!');
            e.preventDefault();
            console.log('Default prevented, calling completeActivity()');
            this.completeActivity();
        });

        // Journal form
        document.getElementById('journalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJournalEntry();
        });

        // Journal content real-time categorization
        document.getElementById('journalContent').addEventListener('input', (e) => {
            this.handleJournalTyping(e.target, 'journalTypeIndicator');
        });

        // Completion journal content real-time categorization
        document.getElementById('completionJournalContent').addEventListener('input', (e) => {
            this.handleCompletionJournalTyping(e.target, 'completionJournalTypeIndicator');
        });

        // Todo form
        document.getElementById('todoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Summary tabs
        document.querySelectorAll('.summary-tab').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSummaryPeriod(e.target.dataset.period));
        });

        // Save to journal checkbox in completion modal
        document.getElementById('saveToJournal').addEventListener('change', (e) => {
            const journalSection = document.getElementById('journalSection');
            if (e.target.checked) {
                journalSection.classList.remove('hidden');
            } else {
                journalSection.classList.add('hidden');
            }
        });

        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('clearCacheBtn').addEventListener('click', () => {
            aiCategorizer.clearCache();
            alert('AI cache cleared!');
            this.updateCacheStats();
        });

        document.getElementById('clearAllDataBtn').addEventListener('click', () => {
            if (confirm('Delete ALL data? This cannot be undone!')) {
                this.storage.clearAll();
                localStorage.clear();
                alert('All data cleared!');
                location.reload();
            }
        });
    }

    handleJournalTyping(textarea, indicatorId) {
        const content = textarea.value;
        const indicator = document.getElementById(indicatorId);

        // Show loading state
        if (content.trim().length >= 10) {
            indicator.innerHTML = '<span class="journal-type-badge detecting">Detecting...</span>';
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
            return;
        }

        // Debounced categorization
        journalCategorizer.categorizeDebounced(content, (type) => {
            if (type) {
                this.currentJournalType = type;
                const icon = type === 'learning' ? '💡' : '💭';
                const color = type === 'learning' ? '#28a745' : '#17a2b8';
                indicator.innerHTML = `<span class="journal-type-badge ${type}" style="background-color: ${color}">Detected: ${type} ${icon}</span>`;
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        });
    }

    handleCompletionJournalTyping(textarea, indicatorId) {
        const content = textarea.value;
        const indicator = document.getElementById(indicatorId);

        // Show loading state
        if (content.trim().length >= 10) {
            indicator.innerHTML = '<span class="journal-type-badge detecting">Detecting...</span>';
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
            return;
        }

        // Debounced categorization
        journalCategorizer.categorizeDebounced(content, (type) => {
            if (type) {
                this.currentCompletionJournalType = type;
                const icon = type === 'learning' ? '💡' : '💭';
                const color = type === 'learning' ? '#28a745' : '#17a2b8';
                indicator.innerHTML = `<span class="journal-type-badge ${type}" style="background-color: ${color}">Detected: ${type} ${icon}</span>`;
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        });
    }

    renderTimeRemaining() {
        const now = new Date();
        const bedtime = new Date();
        bedtime.setHours(23, 0, 0, 0);

        if (now > bedtime) {
            bedtime.setDate(bedtime.getDate() + 1);
        }

        const diff = bedtime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('timeRemaining').innerHTML =
            `<strong>${hours}h ${minutes}m</strong> until bedtime (11 PM)`;
    }

    checkCurrentActivity() {
        if (this.currentActivity) {
            console.log('Checking current activity:', this.currentActivity);
            const startTime = new Date(this.currentActivity.startTime);
            const plannedEnd = new Date(startTime.getTime() + this.currentActivity.plannedDuration * 60000);
            const now = new Date();

            console.log('Start time:', startTime);
            console.log('Planned end:', plannedEnd);
            console.log('Now:', now);

            if (now >= plannedEnd) {
                console.log('Activity time is up, showing completion modal');
                this.showCompletionModal();
            } else {
                console.log('Activity in progress, showing current activity and starting timer');
                this.showCurrentActivity();
                this.startActivityTimer();
            }
        }
    }

    async startActivity() {
        const name = document.getElementById('activityName').value;
        const durationInput = document.getElementById('activityDuration').value;

        // Parse duration with new flexible parser
        const parseResult = parseDuration(durationInput);

        if (!parseResult.success) {
            alert(parseResult.error);
            return;
        }

        const duration = parseResult.minutes;
        console.log('Starting activity:', name, duration);

        const activity = new Activity(name, duration);
        this.currentActivity = activity;

        // Refine category with AI if enabled
        if (config.isAICategorizationEnabled()) {
            await activity.refineCategory();
        }

        this.storage.saveCurrentActivity(activity);

        console.log('Activity created and saved:', activity);

        document.getElementById('activityForm').reset();
        this.showCurrentActivity();
        this.startActivityTimer();
    }

    showCurrentActivity() {
        document.getElementById('newActivitySection').classList.add('hidden');
        document.getElementById('currentActivitySection').classList.remove('hidden');

        const categoryIcon = getCategoryIcon(this.currentActivity.category);
        const info = document.getElementById('currentActivityInfo');
        info.innerHTML = `
            <div class="activity-details">
                <p><strong>Activity:</strong> ${this.currentActivity.name}</p>
                <p><strong>Category:</strong> ${categoryIcon} ${this.currentActivity.category}</p>
                <p><strong>Planned Duration:</strong> ${this.currentActivity.plannedDuration} minutes</p>
            </div>
        `;
    }

    startActivityTimer() {
        console.log('Starting activity timer');
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
        }

        const updateTimer = () => {
            const startTime = new Date(this.currentActivity.startTime);
            const plannedEnd = new Date(startTime.getTime() + this.currentActivity.plannedDuration * 60000);
            const now = new Date();
            const remaining = plannedEnd - now;

            console.log('Timer update - remaining:', remaining);

            if (remaining <= 0) {
                clearInterval(this.currentTimer);
                document.getElementById('activityTimer').innerHTML =
                    '<div class="timer-complete">Time is up! Please complete the activity.</div>';
                this.showCompletionModal();
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                const timerHTML = `<div class="timer-active">${minutes}:${seconds.toString().padStart(2, '0')} remaining</div>`;
                console.log('Setting timer HTML:', timerHTML);
                document.getElementById('activityTimer').innerHTML = timerHTML;
            }
        };

        updateTimer();
        this.currentTimer = setInterval(updateTimer, 1000);
        console.log('Timer started, interval ID:', this.currentTimer);
    }

    showCompletionModal() {
        const modal = document.getElementById('completionModal');
        document.getElementById('actualActivity').value = this.currentActivity.name;
        modal.classList.remove('hidden');
    }

    completeActivity() {
        try {
            console.log('=== COMPLETING ACTIVITY ===');
            console.log('Current activity object:', this.currentActivity);

            if (!this.currentActivity) {
                console.error('ERROR: No current activity to complete!');
                alert('Error: No current activity found. Please refresh the page.');
                return;
            }

            const actualActivity = document.getElementById('actualActivity').value;
            const notes = document.getElementById('activityNotes').value;

            console.log('Actual activity:', actualActivity);
            console.log('Notes:', notes);

            // Manually complete the activity (since it's a plain object from localStorage, not an Activity instance)
            this.currentActivity.endTime = new Date();
            this.currentActivity.actualDuration = Math.round((this.currentActivity.endTime - new Date(this.currentActivity.startTime)) / 60000);
            this.currentActivity.completed = true;
            this.currentActivity.actualActivity = actualActivity || this.currentActivity.name;
            this.currentActivity.notes = notes || '';

            // Re-categorize based on actual activity if different
            if (actualActivity && actualActivity !== this.currentActivity.name) {
                this.currentActivity.category = categorizeActivitySync(actualActivity);
            }

            console.log('Activity after completion:', this.currentActivity);

            this.activities.push(this.currentActivity);
            console.log('Total activities after adding:', this.activities.length);

            this.storage.saveActivities(this.activities);
            console.log('Activities saved to localStorage');

            this.storage.clearCurrentActivity();
            console.log('Current activity cleared from localStorage');

        // Check if user wants to save to journal
        const saveToJournal = document.getElementById('saveToJournal').checked;
        if (saveToJournal) {
            const journalContent = document.getElementById('completionJournalContent').value;
            if (journalContent.trim()) {
                const tagsInput = document.getElementById('completionJournalTags').value;
                const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

                // Use AI-detected type or default to 'thought'
                const journalType = this.currentCompletionJournalType || 'thought';

                // Add activity name as a tag automatically
                if (!tags.includes(this.currentActivity.category)) {
                    tags.push(this.currentActivity.category);
                }

                const entry = journalType === 'learning' ?
                    new Learning(journalContent, tags) :
                    new Thought(journalContent, tags);

                this.journalEntries.push(entry);
                this.storage.saveJournalEntries(this.journalEntries);
            }
        }

        console.log('Hiding completion modal...');
        const modal = document.getElementById('completionModal');
        console.log('Modal element found:', modal);
        console.log('Modal classes before:', modal.className);
        modal.classList.add('hidden');
        console.log('Modal classes after:', modal.className);

        console.log('Resetting completion form...');
        document.getElementById('completionForm').reset();

        console.log('Hiding journal section...');
        document.getElementById('journalSection').classList.add('hidden');

        // Reset completion journal type
        this.currentCompletionJournalType = 'thought';
        document.getElementById('completionJournalTypeIndicator').classList.add('hidden');

        console.log('Hiding current activity section...');
        document.getElementById('currentActivitySection').classList.add('hidden');

        console.log('Showing new activity section...');
        document.getElementById('newActivitySection').classList.remove('hidden');

        if (this.currentTimer) {
            clearInterval(this.currentTimer);
            console.log('Timer cleared');
        }

        this.currentActivity = null;
        console.log('Current activity set to null');

        console.log('Rendering activity history...');
        this.renderActivityHistory();

        console.log('Rendering journal entries...');
        this.renderJournalEntries();

        console.log('=== ACTIVITY COMPLETED SUCCESSFULLY ===');

        } catch (error) {
            console.error('ERROR in completeActivity:', error);
            console.error('Error stack:', error.stack);
            alert('Error completing activity: ' + error.message);
        }
    }

    renderActivityHistory() {
        const list = document.getElementById('activityList');
        const recent = this.activities.slice(-10).reverse();

        if (recent.length === 0) {
            list.innerHTML = '<p class="empty-state">No activities recorded yet.</p>';
            return;
        }

        // Group activities by date
        const groupedActivities = [];
        let currentGroup = null;

        recent.forEach((activity) => {
            const activityDate = new Date(activity.startTime);
            const banner = getDateBanner(activityDate);

            if (!currentGroup || currentGroup.banner !== banner) {
                currentGroup = {
                    banner: banner,
                    date: activityDate,
                    activities: []
                };
                groupedActivities.push(currentGroup);
            }
            currentGroup.activities.push(activity);
        });

        // Render grouped activities
        let html = '';
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        groupedActivities.forEach((group, groupIndex) => {
            const groupDate = new Date(group.date.getFullYear(), group.date.getMonth(), group.date.getDate());
            const diffDays = Math.floor((groupDate - today) / (1000 * 60 * 60 * 24));
            const isExpandedByDefault = diffDays >= -1; // Today (0) and Yesterday (-1)
            const isCollapsible = !isExpandedByDefault;

            // Date banner with optional collapse/expand
            const chevron = isCollapsible ? '<span class="chevron">▼</span>' : '';
            const clickable = isCollapsible ? 'clickable' : '';
            const expandedClass = isExpandedByDefault ? 'expanded' : 'collapsed';

            html += `<div class="date-banner ${clickable} ${expandedClass}" data-group="${groupIndex}">
                        ${group.banner} ${chevron}
                     </div>`;

            html += `<div class="activity-group ${expandedClass}" data-group="${groupIndex}">`;

            // Render activities in this group
            group.activities.forEach((activity) => {
                const categoryIcon = getCategoryIcon(activity.category);
                const categoryColor = getCategoryColor(activity.category);
                const activityIndex = this.activities.findIndex(a => a.id === activity.id);

                html += `
                    <div class="activity-item">
                        <div class="activity-header">
                            <strong>${activity.actualActivity || activity.name}</strong>
                            <div class="activity-actions">
                                <span class="category-badge" style="background-color: ${categoryColor}">
                                    ${categoryIcon} ${activity.category}
                                </span>
                                <button class="btn-edit" onclick="app.editActivity(${activityIndex})">Edit</button>
                                <button class="btn-delete" onclick="app.deleteActivity(${activityIndex})">Delete</button>
                            </div>
                        </div>
                        <div class="activity-meta">
                            <span>${formatDate(new Date(activity.startTime))}</span>
                            <span>${activity.actualDuration || activity.plannedDuration} min</span>
                        </div>
                        ${activity.notes ? `<p class="activity-notes">${activity.notes}</p>` : ''}
                    </div>
                `;
            });

            html += `</div>`; // Close activity-group
        });

        list.innerHTML = html;

        // Add click handlers for collapsible date banners
        document.querySelectorAll('.date-banner.clickable').forEach(banner => {
            banner.addEventListener('click', (e) => {
                const groupIndex = e.currentTarget.dataset.group;
                const group = document.querySelector(`.activity-group[data-group="${groupIndex}"]`);
                const bannerElement = e.currentTarget;

                if (group.classList.contains('collapsed')) {
                    group.classList.remove('collapsed');
                    group.classList.add('expanded');
                    bannerElement.classList.remove('collapsed');
                    bannerElement.classList.add('expanded');
                } else {
                    group.classList.remove('expanded');
                    group.classList.add('collapsed');
                    bannerElement.classList.remove('expanded');
                    bannerElement.classList.add('collapsed');
                }
            });
        });
    }

    editActivity(index) {
        const activity = this.activities[index];
        const newName = prompt('Edit activity name:', activity.actualActivity || activity.name);

        if (newName !== null && newName.trim()) {
            activity.actualActivity = newName.trim();
            activity.category = categorizeActivitySync(newName.trim());

            const newNotes = prompt('Edit notes:', activity.notes || '');
            if (newNotes !== null) {
                activity.notes = newNotes;
            }

            this.storage.saveActivities(this.activities);
            this.renderActivityHistory();
        }
    }

    deleteActivity(index) {
        const activity = this.activities[index];
        const confirmed = confirm(`Delete activity "${activity.actualActivity || activity.name}"?`);

        if (confirmed) {
            this.activities.splice(index, 1);
            this.storage.saveActivities(this.activities);
            this.renderActivityHistory();
        }
    }

    saveJournalEntry() {
        const content = document.getElementById('journalContent').value;
        const tagsInput = document.getElementById('journalTags').value;
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

        // Use AI-detected type or default to 'thought'
        const type = this.currentJournalType || 'thought';

        const entry = type === 'learning' ?
            new Learning(content, tags) :
            new Thought(content, tags);

        this.journalEntries.push(entry);
        this.storage.saveJournalEntries(this.journalEntries);

        document.getElementById('journalForm').reset();
        document.getElementById('journalTypeIndicator').classList.add('hidden');
        this.currentJournalType = 'thought'; // Reset to default
        this.renderJournalEntries();
    }

    renderJournalEntries(filterTag = null) {
        const container = document.getElementById('journalEntries');
        let entries = this.journalEntries.slice().reverse();

        if (filterTag) {
            entries = entries.filter(e => e.tags.includes(filterTag));
        }

        if (entries.length === 0) {
            container.innerHTML = '<p class="empty-state">No entries yet.</p>';
        } else {
            container.innerHTML = entries.map(entry => {
                const entryIndex = this.journalEntries.findIndex(e => e.id === entry.id);
                return `
                    <div class="journal-item ${entry.type}">
                        <div class="journal-header">
                            <div>
                                <span class="journal-type">${entry.type}</span>
                                <span class="journal-date">${formatDate(new Date(entry.timestamp))}</span>
                            </div>
                            <div class="journal-actions">
                                <button class="btn-edit" onclick="app.editJournalEntry(${entryIndex})">Edit</button>
                                <button class="btn-delete" onclick="app.deleteJournalEntry(${entryIndex})">Delete</button>
                            </div>
                        </div>
                        <p class="journal-content">${entry.content}</p>
                        ${entry.tags.length > 0 ? `
                            <div class="journal-tags">
                                ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        this.renderTagFilters();
        // Render tag suggestions for both forms
        this.renderTagSuggestions('journalTags', 'journalTagSuggestions');
        this.renderTagSuggestions('completionJournalTags', 'completionJournalTagSuggestions');
    }

    editJournalEntry(index) {
        const entry = this.journalEntries[index];
        const newContent = prompt('Edit content:', entry.content);

        if (newContent !== null && newContent.trim()) {
            entry.content = newContent.trim();

            const newTags = prompt('Edit tags (comma-separated):', entry.tags.join(', '));
            if (newTags !== null) {
                entry.tags = newTags.split(',').map(t => t.trim()).filter(t => t);
            }

            this.storage.saveJournalEntries(this.journalEntries);
            this.renderJournalEntries();
        }
    }

    deleteJournalEntry(index) {
        const entry = this.journalEntries[index];
        const confirmed = confirm(`Delete this ${entry.type}?`);

        if (confirmed) {
            this.journalEntries.splice(index, 1);
            this.storage.saveJournalEntries(this.journalEntries);
            this.renderJournalEntries();
        }
    }

    renderTagFilters() {
        const allTags = new Set();
        this.journalEntries.forEach(entry => {
            entry.tags.forEach(tag => allTags.add(tag));
        });

        const container = document.getElementById('tagFilters');
        if (allTags.size === 0) {
            container.innerHTML = '<p class="empty-state">No tags yet.</p>';
        } else {
            container.innerHTML = `
                <button class="tag-filter active" data-tag="">All</button>
                ${[...allTags].map(tag => `
                    <button class="tag-filter" data-tag="${tag}">${tag}</button>
                `).join('')}
            `;

            container.querySelectorAll('.tag-filter').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    container.querySelectorAll('.tag-filter').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.renderJournalEntries(e.target.dataset.tag || null);
                });
            });
        }
    }

    renderTagSuggestions(inputId, containerId) {
        // Extract all tags with frequency
        const tagFrequency = new Map();
        this.journalEntries.forEach(entry => {
            entry.tags.forEach(tag => {
                tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
            });
        });

        // Sort by frequency (most used first), limit to top 15
        const sortedTags = Array.from(tagFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        const container = document.getElementById(containerId);
        const inputField = document.getElementById(inputId);

        if (sortedTags.length === 0) {
            container.innerHTML = '<p class="empty-state" style="padding: 10px; font-size: 0.85em;">No tags yet. Start typing to create new tags.</p>';
            return;
        }

        container.innerHTML = `
            <div class="tag-suggestions-label">Suggested tags (click to add):</div>
            <div class="tag-chips">
                ${sortedTags.map(([tag, count]) => `
                    <button type="button" class="tag-chip" data-tag="${tag}">
                        ${tag} <span class="tag-count">(${count})</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Add click handlers
        container.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const tag = chip.dataset.tag;
                const currentValue = inputField.value.trim();

                // Check if tag already exists in input
                const existingTags = currentValue.split(',').map(t => t.trim()).filter(t => t);
                if (existingTags.includes(tag)) {
                    return; // Tag already added
                }

                // Add tag to input
                if (currentValue) {
                    inputField.value = currentValue + ', ' + tag;
                } else {
                    inputField.value = tag;
                }

                // Visual feedback
                chip.classList.add('tag-chip-added');
                setTimeout(() => chip.classList.remove('tag-chip-added'), 300);
            });
        });
    }

    addTodo() {
        const title = document.getElementById('todoTitle').value;
        const dueDate = document.getElementById('todoDueDate').value;
        const reminder = document.getElementById('todoReminder').value;

        const todo = new Todo(
            title,
            dueDate ? new Date(dueDate) : null,
            reminder ? new Date(reminder) : null
        );

        this.todos.push(todo);
        this.storage.saveTodos(this.todos);

        document.getElementById('todoForm').reset();
        this.renderTodos();
    }

    renderTodos() {
        const container = document.getElementById('todoList');
        const sortedTodos = this.todos.slice().sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        if (sortedTodos.length === 0) {
            container.innerHTML = '<p class="empty-state">No todos yet.</p>';
        } else {
            container.innerHTML = sortedTodos.map((todo, index) => `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}
                           onchange="app.toggleTodo(${this.todos.indexOf(todo)})">
                    <div class="todo-content">
                        <div class="todo-title">${todo.title}</div>
                        ${todo.dueDate ? `<div class="todo-due">Due: ${formatDate(new Date(todo.dueDate))}</div>` : ''}
                        ${todo.reminder ? `<div class="todo-reminder">Reminder: ${formatDate(new Date(todo.reminder))}</div>` : ''}
                    </div>
                    <button onclick="app.deleteTodo(${this.todos.indexOf(todo)})" class="btn-delete">Delete</button>
                </div>
            `).join('');
        }
    }

    toggleTodo(index) {
        this.todos[index].toggleComplete();
        this.storage.saveTodos(this.todos);
        this.renderTodos();
    }

    deleteTodo(index) {
        this.todos.splice(index, 1);
        this.storage.saveTodos(this.todos);
        this.renderTodos();
    }

    startReminderCheck() {
        this.reminderCheckInterval = setInterval(() => {
            const now = new Date();
            this.todos.forEach(todo => {
                if (!todo.completed && todo.reminder) {
                    const reminderTime = new Date(todo.reminder);
                    if (now >= reminderTime && now - reminderTime < 60000) {
                        alert(`Reminder: ${todo.title}`);
                    }
                }
            });
        }, 60000);
    }

    switchView(viewName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById(`${viewName}View`).classList.add('active');

        if (viewName === 'summary') {
            this.renderSummary('daily');
        }

        if (viewName === 'settings') {
            this.loadSettings();
        }
    }

    switchSummaryPeriod(period) {
        document.querySelectorAll('.summary-tab').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        this.renderSummary(period);
    }

    renderSummary(period) {
        console.log('Rendering summary for period:', period);
        console.log('Total activities:', this.activities.length);

        const container = document.getElementById('summaryContent');
        const range = getDateRange(period);

        console.log('Date range:', range);

        const filtered = this.activities.filter(a => {
            const activityDate = new Date(a.startTime);
            const isInRange = activityDate >= range.start && activityDate <= range.end;
            console.log('Activity:', a.name, 'Date:', activityDate, 'In range:', isInRange);
            return isInRange;
        });

        console.log('Filtered activities:', filtered.length);

        container.innerHTML = renderSummary(filtered, period);
    }

    saveSettings() {
        const apiKey = document.getElementById('anthropicApiKey').value;
        const mode = document.getElementById('categorizationMode').value;

        if (apiKey) {
            config.setAnthropicApiKey(apiKey);
            console.log('API key saved');
        }

        config.setCategorizationMode(mode);
        console.log('Categorization mode:', mode);

        alert('Settings saved!');
        this.updateCacheStats();
    }

    loadSettings() {
        const apiKey = config.getAnthropicApiKey();
        const mode = config.getCategorizationMode();

        if (apiKey) {
            document.getElementById('anthropicApiKey').value = apiKey;
        }

        document.getElementById('categorizationMode').value = mode;
        this.updateCacheStats();
    }

    updateCacheStats() {
        const stats = aiCategorizer.getCacheStats();
        const statsDiv = document.getElementById('cacheStats');

        if (stats.entries > 0) {
            statsDiv.innerHTML = `
                <p><strong>Cache Statistics:</strong></p>
                <p>Cached categorizations: ${stats.entries}</p>
                <p>Estimated cost saved: $${stats.estimatedCost.toFixed(4)}</p>
            `;
        } else {
            statsDiv.innerHTML = '<p>No cached categorizations yet.</p>';
        }
    }
}

// Global app instance for inline event handlers
window.app = new ActivityTrackerApp();
