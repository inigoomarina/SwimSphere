// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9);
};

/**
 * Formats a swim time in seconds to a human-readable format (MM:SS.ss)
 * @param {number} timeInSeconds - Time in seconds
 * @return {string} Formatted time string
 */
export const formatSwimTime = (timeInSeconds) => {
  if (!timeInSeconds && timeInSeconds !== 0) return '--';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  
  // Format seconds with two decimal places
  const formattedSeconds = seconds.toFixed(2).padStart(5, '0');
  
  // For times less than a minute, don't show leading zeros
  if (minutes === 0) {
    return formattedSeconds;
  }
  
  // Format as MM:SS.ss
  return `${minutes}:${formattedSeconds}`;
};

// Format time input (for UI)
export const formatTimeInput = (value) => {
  // Logic to format a time input value
  // Can be customized based on your requirements
  return value;
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