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

// Format swim time from seconds to MM:SS.ms
export const formatSwimTime = (timeInSeconds) => {
  if (!timeInSeconds) return '--';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.round((timeInSeconds - Math.floor(timeInSeconds)) * 100);
  
  return `${minutes > 0 ? minutes + ':' : ''}${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
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