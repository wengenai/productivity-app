// Utility Functions

export function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

export function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (diffDays === 0) {
        return `Today at ${timeStr}`;
    } else if (diffDays === -1) {
        return `Yesterday at ${timeStr}`;
    } else if (diffDays === 1) {
        return `Tomorrow at ${timeStr}`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

export function getDateRange(period) {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
        case 'daily':
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'weekly':
            const dayOfWeek = now.getDay();
            start.setDate(now.getDate() - dayOfWeek);
            start.setHours(0, 0, 0, 0);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
        case 'monthly':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
            break;
    }

    return { start, end };
}

export function updateTimeRemaining() {
    const now = new Date();
    const bedtime = new Date();
    bedtime.setHours(23, 0, 0, 0);

    if (now > bedtime) {
        bedtime.setDate(bedtime.getDate() + 1);
    }

    const diff = bedtime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
}

export function getDateBanner(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === -1) {
        return 'Yesterday';
    } else if (diffDays >= -6 && diffDays < 0) {
        // Within last week, show day name
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
        // Older dates, show full date
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

export function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

export function parseDuration(input) {
    // Returns: { success: boolean, minutes: number, error: string }

    const trimmed = input.trim().toLowerCase();

    // Empty input — stopwatch mode (no planned duration)
    if (!trimmed) {
        return { success: true, minutes: null, error: null };
    }

    // Plain number (default to minutes)
    if (/^\d+$/.test(trimmed)) {
        const minutes = parseInt(trimmed, 10);
        if (minutes < 1) {
            return { success: false, minutes: null, error: 'Duration must be at least 1 minute' };
        }
        return { success: true, minutes, error: null };
    }

    // Hour format: "1h", "2h", etc.
    const hourMatch = /^(\d+)h$/i.exec(trimmed);
    if (hourMatch) {
        const hours = parseInt(hourMatch[1], 10);
        const minutes = hours * 60;
        if (minutes < 1) {
            return { success: false, minutes: null, error: 'Duration must be at least 1 minute' };
        }
        return { success: true, minutes, error: null };
    }

    // Combined format: "1h30m", "2h15m", etc.
    const combinedMatch = /^(\d+)h(\d+)m$/i.exec(trimmed);
    if (combinedMatch) {
        const hours = parseInt(combinedMatch[1], 10);
        const mins = parseInt(combinedMatch[2], 10);
        const totalMinutes = hours * 60 + mins;
        if (totalMinutes < 1) {
            return { success: false, minutes: null, error: 'Duration must be at least 1 minute' };
        }
        return { success: true, minutes: totalMinutes, error: null };
    }

    // Minutes only format: "30m", "45m"
    const minutesMatch = /^(\d+)m$/i.exec(trimmed);
    if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1], 10);
        if (minutes < 1) {
            return { success: false, minutes: null, error: 'Duration must be at least 1 minute' };
        }
        return { success: true, minutes, error: null };
    }

    // Invalid format
    return {
        success: false,
        minutes: null,
        error: 'Invalid format. Use: 60 (minutes), 1h (hours), or 1h30m (combined)'
    };
}
