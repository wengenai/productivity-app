// Summary and Analytics

import { formatDuration } from './utils.js';
import { getCategoryColor, getCategoryIcon } from './categorizer.js';

export function renderSummary(activities, period) {
    if (activities.length === 0) {
        return '<p class="empty-state">No activities recorded for this period.</p>';
    }

    const stats = calculateStats(activities);
    const categoryBreakdown = getCategoryBreakdown(activities);

    return `
        <div class="summary-stats">
            <div class="stat-card">
                <h3>Total Activities</h3>
                <div class="stat-value">${activities.length}</div>
            </div>
            <div class="stat-card">
                <h3>Total Time</h3>
                <div class="stat-value">${formatDuration(stats.totalMinutes)}</div>
            </div>
            <div class="stat-card">
                <h3>Average Duration</h3>
                <div class="stat-value">${formatDuration(stats.averageMinutes)}</div>
            </div>
            <div class="stat-card">
                <h3>Most Active Category</h3>
                <div class="stat-value">${stats.topCategory || 'N/A'}</div>
            </div>
        </div>

        <div class="category-breakdown">
            <h3>Time by Category</h3>
            <div class="category-chart">
                ${renderCategoryChart(categoryBreakdown, stats.totalMinutes)}
            </div>
            <div class="category-list">
                ${renderCategoryList(categoryBreakdown)}
            </div>
        </div>

        <div class="recent-activities">
            <h3>Activity Timeline</h3>
            ${renderActivityTimeline(activities)}
        </div>
    `;
}

function calculateStats(activities) {
    const totalMinutes = activities.reduce((sum, a) => sum + (a.actualDuration || a.plannedDuration), 0);
    const averageMinutes = Math.round(totalMinutes / activities.length);

    const categoryTotals = {};
    activities.forEach(a => {
        const duration = a.actualDuration || a.plannedDuration;
        categoryTotals[a.category] = (categoryTotals[a.category] || 0) + duration;
    });

    const topCategory = Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b, null);

    return {
        totalMinutes,
        averageMinutes,
        topCategory,
        categoryTotals
    };
}

function getCategoryBreakdown(activities) {
    const breakdown = {};

    activities.forEach(activity => {
        const category = activity.category;
        const duration = activity.actualDuration || activity.plannedDuration;

        if (!breakdown[category]) {
            breakdown[category] = {
                count: 0,
                totalMinutes: 0
            };
        }

        breakdown[category].count++;
        breakdown[category].totalMinutes += duration;
    });

    return breakdown;
}

function renderCategoryChart(breakdown, totalMinutes) {
    const sorted = Object.entries(breakdown)
        .sort((a, b) => b[1].totalMinutes - a[1].totalMinutes);

    return sorted.map(([category, data]) => {
        const percentage = ((data.totalMinutes / totalMinutes) * 100).toFixed(1);
        const categoryColor = getCategoryColor(category);
        const categoryIcon = getCategoryIcon(category);
        return `
            <div class="chart-bar">
                <div class="chart-label">${categoryIcon} ${category}</div>
                <div class="chart-bar-outer">
                    <div class="chart-bar-inner" style="width: ${percentage}%; background: ${categoryColor}">
                        ${percentage}%
                    </div>
                </div>
                <div class="chart-value">${formatDuration(data.totalMinutes)}</div>
            </div>
        `;
    }).join('');
}

function renderCategoryList(breakdown) {
    const sorted = Object.entries(breakdown)
        .sort((a, b) => b[1].totalMinutes - a[1].totalMinutes);

    return `
        <table class="category-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Total Time</th>
                    <th>Avg Time</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(([category, data]) => {
                    const categoryColor = getCategoryColor(category);
                    const categoryIcon = getCategoryIcon(category);
                    return `
                        <tr>
                            <td><span class="category-badge" style="background-color: ${categoryColor}">${categoryIcon} ${category}</span></td>
                            <td>${data.count}</td>
                            <td>${formatDuration(data.totalMinutes)}</td>
                            <td>${formatDuration(Math.round(data.totalMinutes / data.count))}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderActivityTimeline(activities) {
    const sorted = activities.slice().sort((a, b) =>
        new Date(b.startTime) - new Date(a.startTime)
    );

    return `
        <div class="timeline">
            ${sorted.map(activity => {
                const startTime = new Date(activity.startTime);
                const timeStr = startTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const dateStr = startTime.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });

                const categoryColor = getCategoryColor(activity.category);
                const categoryIcon = getCategoryIcon(activity.category);

                return `
                    <div class="timeline-item">
                        <div class="timeline-time">
                            <div>${timeStr}</div>
                            <div class="timeline-date">${dateStr}</div>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <strong>${activity.actualActivity || activity.name}</strong>
                                <span class="category-badge" style="background-color: ${categoryColor}">${categoryIcon} ${activity.category}</span>
                            </div>
                            <div class="timeline-meta">
                                Duration: ${formatDuration(activity.actualDuration || activity.plannedDuration)}
                            </div>
                            ${activity.notes ? `<p class="timeline-notes">${activity.notes}</p>` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
