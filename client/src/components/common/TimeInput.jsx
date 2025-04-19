import React, { useState, useEffect } from 'react';

const TimeInput = ({ value, onChange, name, id, required, className }) => {
  const [displayValue, setDisplayValue] = useState('');
  
  // Format time on initial render and when value changes
  useEffect(() => {
    if (value !== null && value !== undefined && value !== '') {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      const secondsFormatted = seconds.toFixed(2);
      const secondsWithLeadingZero = secondsFormatted < 10 ? `0${secondsFormatted}` : secondsFormatted;
      setDisplayValue(`${minutes}:${secondsWithLeadingZero}`);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    try {
      const inputValue = e.target.value;
      
      // Only allow numbers, colon, and decimal point
      const sanitizedValue = inputValue.replace(/[^\d:.]/g, '');
      setDisplayValue(sanitizedValue);
      
      // Parse the time value into seconds
      if (sanitizedValue) {
        let seconds = 0;
        
        if (sanitizedValue.includes(':')) {
          const [minutes, secondsPart] = sanitizedValue.split(':');
          seconds = parseInt(minutes || 0) * 60;
          
          if (secondsPart) {
            // Handle decimal seconds correctly
            seconds += parseFloat(secondsPart);
          }
        } else {
          seconds = parseFloat(sanitizedValue);
        }
        
        onChange({ target: { name, value: seconds } });
      } else {
        onChange({ target: { name, value: '' } });
      }
    } catch (error) {
      console.error('Error in TimeInput handleChange:', error);
      onChange({ target: { name, value: '' } });
    }
  };

  // Format as user types to maintain 00:00.00 format
  const handleBlur = () => {
    try {
      if (displayValue) {
        // Ensure proper formatting on blur
        let formattedValue = displayValue;
        
        if (!displayValue.includes(':')) {
          // Convert single number to seconds
          formattedValue = `0:${parseFloat(displayValue) < 10 ? '0' : ''}${displayValue}`;
        } else {
          const [minutes, seconds] = displayValue.split(':');
          
          const formattedMinutes = minutes || '0';
          let formattedSeconds = seconds || '00.00';
          
          if (!seconds || !seconds.includes('.')) {
            formattedSeconds = `${seconds || '00'}.00`;
          } else if (seconds.split('.')[1].length === 1) {
            formattedSeconds = `${seconds}0`;
          }
          
          formattedValue = `${formattedMinutes}:${formattedSeconds.length < 5 ? formattedSeconds.padStart(5, '0') : formattedSeconds}`;
        }
        
        setDisplayValue(formattedValue);
      }
    } catch (error) {
      console.error('Error in TimeInput handleBlur:', error);
    }
  };

  return (
    <input
      type="text"
      id={id}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="0:00.00"
      className={`time-input ${className || ''}`}
      required={required}
    />
  );
};

export default TimeInput;
