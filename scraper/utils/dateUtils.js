// First, let's create a utility function to handle date conversions

function standardizeDate(dateStr) {
    if (!dateStr) return null;
    
    const now = new Date();
    
    // Handle Unix timestamp (milliseconds)
    if (typeof dateStr === 'number' || !isNaN(dateStr)) {
        const timestamp = parseInt(dateStr);
        if (timestamp > 1000000000000) { // Timestamp in milliseconds
            const date = new Date(timestamp);
            return date.toISOString().split('T')[0];
        } else if (timestamp > 1000000000) { // Timestamp in seconds
            const date = new Date(timestamp * 1000);
            return date.toISOString().split('T')[0];
        }
    }
    
    const str = String(dateStr).toLowerCase().trim();

    
    // Handle month-day format (e.g., "Nov 1", "Dec 2")
    const monthMap = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    
    // Updated regex to be more flexible with spaces and digits
    const monthDayMatch = str.match(/^([a-z]{3})\s*(\d{1,2})\s*$/i);
    if (monthDayMatch) {
        const month = monthMap[monthDayMatch[1].toLowerCase()];
        const day = parseInt(monthDayMatch[2]);
        if (month !== undefined && day >= 1 && day <= 31) {
            const date = new Date(now.getFullYear(), month, day);
            // If the resulting date is in the future, use previous year
            if (date > now) {
                date.setFullYear(date.getFullYear() - 1);
            }
            const result = date.toISOString().split('T')[0];
            return result;
        }
    }
    
    
    // Handle "today" and "yesterday"
    if (str === 'today' || str === 'Today') {
        return now.toISOString().split('T')[0];
    }
    
    if (str === 'yesterday' || str === 'Yesterday') {
        const yesterday = new Date(now - 24 * 60 * 60 * 1000);
        return yesterday.toISOString().split('T')[0];
    }
    
    // Handle relative dates (e.g., "2w ago", "3d ago")
    if (str.includes('w') || str.includes('week')) {
        const weeks = parseInt(str);
        const date = new Date(now - weeks * 7 * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
    }
    
    if (str.includes('d') || str.includes('day') || str.includes('days')) {
        const days = parseInt(str);
        const date = new Date(now - days * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
    }
    
    if (str.includes('h') || str.includes('hour')) {
        const hours = parseInt(str);
        const date = new Date(now - hours * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
    }
    
    if (str.includes('m') && !str.includes('month')) {
        const minutes = parseInt(str);
        const date = new Date(now - minutes * 60 * 1000);
        return date.toISOString().split('T')[0];
    }
    
    if (str.includes('month')) {
        const months = parseInt(str);
        const date = new Date(now);
        date.setMonth(date.getMonth() - months);
        return date.toISOString().split('T')[0];
    }
    
    // Try parsing as ISO date
    try {
        const date = new Date(str);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        console.error('Error parsing date:', str);
    }
    
    return null;
}

export default standardizeDate; 