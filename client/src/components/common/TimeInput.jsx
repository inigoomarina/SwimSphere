import React, { useState, useEffect } from 'react';

const TimeInput = ({ value, onChange, name, id, required, className }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Function to format raw digits into mm:ss.tt
  const formatDigits = (digits) => {
    if (!digits) return '';
    
    const len = digits.length;
    let minutes = '0';
    let seconds = '00';
    let tenths = '00';

    if (len <= 2) { // Only tenths
      tenths = digits.padEnd(2, '0');
    } else if (len <= 4) { // Seconds and tenths
      seconds = digits.slice(0, len - 2).padStart(2, '0');
      tenths = digits.slice(len - 2).padEnd(2, '0');
    } else { // Minutes, seconds, and tenths
      minutes = digits.slice(0, len - 4);
      seconds = digits.slice(len - 4, len - 2).padStart(2, '0');
      tenths = digits.slice(len - 2).padEnd(2, '0');
    }
    
    // Ensure seconds and minutes are valid numbers
    seconds = seconds.length > 2 ? seconds.slice(-2) : seconds;
    minutes = minutes || '0'; // Default to 0 if empty

    return `${minutes}:${seconds}.${tenths}`;
  };

  // Function to parse formatted time string back to seconds
  const parseFormattedTime = (formattedTime) => {
    if (!formattedTime) return '';
    const parts = formattedTime.match(/(\d+):(\d{2})\.(\d{2})/);
    if (parts) {
      const [, min, sec, ten] = parts;
      return parseFloat(min) * 60 + parseFloat(sec) + parseFloat(ten) / 100;
    }
    // Fallback for partial input or direct seconds input (less likely with formatting)
    const numericValue = parseFloat(formattedTime.replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? '' : numericValue;
  };

  // Update display value when the external value prop changes
  useEffect(() => {
    if (value !== null && value !== undefined && value !== '') {
      const totalSeconds = parseFloat(value);
      if (!isNaN(totalSeconds)) {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        const secondsFormatted = remainingSeconds.toFixed(2);
        const secondsWithLeadingZero = secondsFormatted < 10 ? `0${secondsFormatted}` : secondsFormatted;
        setDisplayValue(`${minutes}:${secondsWithLeadingZero}`);
      } else {
        setDisplayValue('');
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);


  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Extract only digits
    const digits = inputValue.replace(/[^\d]/g, '');
    
    // Limit total digits (e.g., 99:59.99 -> 6 digits max)
    const limitedDigits = digits.slice(0, 6); 
    
    const formatted = formatDigits(limitedDigits);
    setDisplayValue(formatted);

    // Calculate total seconds and pass to parent onChange
    const totalSeconds = parseFormattedTime(formatted);
    onChange({ target: { name, value: totalSeconds } });
  };

  return (
    <input
      type="text" // Use text to allow custom formatting
      inputMode="decimal" // Hint for numeric keyboard on mobile
      id={id}
      name={name}
      value={displayValue}
      onChange={handleChange}
      // Removed onBlur as formatting happens live
      placeholder="0:00.00"
      className={`time-input ${className || ''}`}
      required={required}
    />
  );
};

export default TimeInput;
