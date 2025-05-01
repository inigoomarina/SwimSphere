import React, { useMemo } from 'react'; // Removed useEffect as it wasn't used
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js'; // Import TimeScale
import 'chartjs-adapter-date-fns'; // Import the date adapter
import { addDays, subDays, min, max, differenceInDays } from 'date-fns'; // Import more date-fns functions

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale); // Register TimeScale

const PerformanceChart = ({ 
  title, 
  data = { labels: [], datasets: [] },  // Expect data in { labels: [], datasets: [{ label: 'Event', data: [{ x: date, y: time }] }] } format
  selectedStroke = null, // This might not be needed if data is pre-filtered
  height = 300, 
  showLegend = true,
  event = null // Keep for title fallback, but data prop is primary
}) => {
  // Format seconds to mm:ss.ms format for tooltips
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00.00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Process the provided data prop
  const chartData = useMemo(() => {
    const hasRealData = data?.datasets?.length > 0 && 
                        data.datasets.some(dataset => Array.isArray(dataset.data) && dataset.data.length > 0);

    if (hasRealData) {
      if (selectedStroke && selectedStroke !== 'all') {
        const filteredDatasets = data.datasets.filter(dataset => {
          const labelParts = dataset.label.toLowerCase().split(' ');
          return labelParts.includes(selectedStroke.toLowerCase());
        });
        
        if (filteredDatasets.length > 0 && filteredDatasets.some(ds => ds.data.length > 0)) {
          return {
            labels: data.labels, 
            datasets: filteredDatasets.map(ds => ({
              ...ds,
              borderColor: ds.borderColor || '#0066cc',
              backgroundColor: ds.backgroundColor || 'rgba(0, 102, 204, 0.2)',
              fill: true,
              tension: 0.1,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: ds.borderColor || '#0066cc',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              showLine: ds.data.length > 1
            }))
          };
        }
      }
      
      return {
        labels: data.labels,
        datasets: data.datasets.map(ds => ({
          ...ds,
          borderColor: ds.borderColor || '#0066cc',
          backgroundColor: ds.backgroundColor || 'rgba(0, 102, 204, 0.1)',
          fill: false,
          tension: 0.1,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: ds.borderColor || '#0066cc',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          showLine: ds.data.length > 1
        }))
      };
    }
    
    return { labels: [], datasets: [] };
  }, [data, selectedStroke]);

  // Determine if there's only one data point across all datasets
  const singleDataPoint = useMemo(() => {
    if (!chartData || !chartData.datasets) return null;
    const totalPoints = chartData.datasets.reduce((sum, ds) => sum + (ds.data?.length || 0), 0);
    if (totalPoints === 1) {
      for (const ds of chartData.datasets) {
        if (ds.data?.length === 1) {
          return ds.data[0];
        }
      }
    }
    return null;
  }, [chartData]);

  // Calculate appropriate date bounds for the x-axis
  const dateRange = useMemo(() => {
    if (singleDataPoint) {
      // For a single point, use small padding (3 days on each side)
      const date = new Date(singleDataPoint.x);
      return {
        min: subDays(date, 3),
        max: addDays(date, 3)
      };
    }

    // For multiple points, find the min and max dates
    let minDate = null;
    let maxDate = null;

    chartData.datasets.forEach(dataset => {
      dataset.data.forEach(point => {
        const date = new Date(point.x);
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      });
    });

    if (!minDate || !maxDate) return { min: undefined, max: undefined };

    // Calculate the date range in days
    const daysDifference = differenceInDays(maxDate, minDate);
    
    // If dates are very close (less than 7 days apart), use minimal padding
    if (daysDifference <= 7) {
      // Use 1 day of padding for consecutive days, otherwise 20% of range
      const paddingDays = daysDifference <= 1 ? 1 : Math.max(1, Math.ceil(daysDifference * 0.2));
      return {
        min: subDays(minDate, paddingDays),
        max: addDays(maxDate, paddingDays)
      };
    } 
    
    // For wider ranges, use proportional padding
    const paddingDays = Math.max(3, Math.ceil(daysDifference * 0.1)); // At least 3 days, or 10% of range
    
    return {
      min: subDays(minDate, paddingDays),
      max: addDays(maxDate, paddingDays)
    };
  }, [chartData, singleDataPoint]);

  // Chart options using TimeScale for x-axis
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        reverse: true,
        title: {
          display: true,
          text: 'Time',
          font: { size: 12, weight: 'bold' }
        },
        ticks: {
          callback: formatTime
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM d, yyyy',
          displayFormats: {
            day: 'MMM d',
            month: 'MMM yyyy',
            year: 'yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date',
          font: { size: 12, weight: 'bold' }
        },
        grid: { display: false },
        min: dateRange.min?.toISOString(),
        max: dateRange.max?.toISOString(),
        ticks: {
          source: 'auto',
          autoSkip: true,
          maxTicksLimit: 5 // Limit number of ticks to avoid overcrowding
        }
      }
    },
    plugins: {
      title: {
        display: !!title || !!event,
        text: title || event || 'Swim Time Progress',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      },
      legend: {
        display: showLegend && chartData.datasets.length > 1,
        position: 'top',
        labels: { usePointStyle: true, pointStyle: 'circle', padding: 15 }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Time: ${formatTime(context.raw.y)}`; 
          },
          title: function(tooltipItems) {
            const date = new Date(tooltipItems[0].raw.x);
            return `${tooltipItems[0].dataset.label} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
  }), [title, event, showLegend, chartData.datasets, dateRange]);

  const hasDisplayableData = chartData.datasets.length > 0 && 
                             chartData.datasets.some(ds => ds.data.length > 0);

  return (
    <div className="performance-chart-container" style={{ height: `${height}px` }}>
      {hasDisplayableData ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="no-chart-data">
          <p>No swim time data available for {event || 'this event'}.</p>
          <p className="secondary-message">Add swim times to see your progression!</p>
        </div>
      )}
    </div>
  );
};

PerformanceChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.shape({
          x: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
          y: PropTypes.number.isRequired
        })).isRequired,
        borderColor: PropTypes.string,
        backgroundColor: PropTypes.string
      })
    )
  }),
  selectedStroke: PropTypes.string,
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  event: PropTypes.string
};

export default PerformanceChart;
