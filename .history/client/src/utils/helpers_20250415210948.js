export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US');
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Format seconds to mm:ss.ms format
export const formatSwimTime = (seconds) => {
    if (!seconds && seconds !== 0) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Generate chart colors with transparency
export const generateChartColors = (count) => {
    const baseColors = [
        '#4BC0C0', // teal
        '#FF6384', // red
        '#36A2EB', // blue
        '#FFCE56', // yellow
        '#9966FF', // purple
        '#FF9F40', // orange
        '#8AC54B', // green
    ];
    
    return Array(count).fill(0).map((_, index) => {
        const color = baseColors[index % baseColors.length];
        return {
            borderColor: color,
            backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba')
        };
    });
};