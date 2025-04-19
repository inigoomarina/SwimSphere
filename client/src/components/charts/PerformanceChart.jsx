import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';
import './PerformanceChart.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PerformanceChart = ({ 
  title, 
  data = { labels: [], datasets: [] },  // Provide default empty data structure
  selectedStroke = null, 
  height = 300, 
  showLegend = true,
  event = null
}) => {
  // Format seconds to mm:ss.ms format for tooltips
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00.00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Generate sample data for development/demo when data is not provided
  const demoData = useMemo(() => {
    if (event) {
      // Extract event details (e.g., "100m freestyle" -> "freestyle", 100)
      const parts = event.split('m ');
      const distance = parseInt(parts[0]);
      const stroke = parts[1];
      
      // Generate dates for the last 12 months
      const dates = [];
      const times = [];
      const labels = [];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        dates.push(date);
        
        // Generate progressively improving times (with some variation)
        // Start at a baseline time depending on the distance
        const baseTime = distance / 25; // E.g., 100m -> 4 seconds base
        const improvementFactor = 0.98; // 2% improvement each time
        const randomVariation = () => Math.random() * 0.05 - 0.025; // ±2.5% random variation
        
        // Generate a time that improves over time but with some random variation
        const time = baseTime * Math.pow(improvementFactor, 11-i) * (1 + randomVariation());
        times.push(time);
        
        // Format date as month and year
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      }
      
      return {
        labels,
        datasets: [
          {
            label: `${distance}m ${stroke}`,
            data: times,
            borderColor: '#0066cc',
            backgroundColor: 'rgba(0, 102, 204, 0.2)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#0066cc',
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      };
    }
    
    return { labels: [], datasets: [] };
  }, [event]);

  // Use provided data or fallback to demo data
  const chartData = useMemo(() => {
    if (data?.datasets?.length > 0) {
      // If we have filtered data by stroke type
      if (selectedStroke && selectedStroke !== 'all') {
        return {
          labels: data.labels,
          datasets: data.datasets.filter(dataset => {
            const labelParts = dataset.label.split(' ');
            return labelParts[0] === selectedStroke;
          })
        };
      }
      // Return all data if no stroke filter is applied
      return data;
    }
    
    // Fallback to demo data when no actual data is provided
    return demoData;
  }, [data, selectedStroke, demoData]);

  // Chart options with improved styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        reverse: true, // Lower times are better
        title: {
          display: true,
          text: 'Time (seconds)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          callback: formatTime
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      title: {
        display: !!title,
        text: title || event || 'Swim Time Progress',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15
        }
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
            return `Time: ${formatTime(context.raw)}`;
          },
          title: function(tooltipItems) {
            return tooltipItems[0].dataset.label + ' - ' + tooltipItems[0].label;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  return (
    <div className="performance-chart-container" style={{ height: `${height}px` }}>
      {chartData.datasets.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="no-chart-data">
          <p>No swim time data available for {event || 'the selected stroke'}.</p>
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
        data: PropTypes.array.isRequired,
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
