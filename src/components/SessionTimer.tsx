import React, { useState, useEffect } from 'react';

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function SessionTimer({ 
  isActive, 
  initialTime = 0,
  onTick
}: { 
  isActive: boolean, 
  initialTime?: number,
  onTick?: (time: number) => void
}) {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime(t => {
          const newTime = t + 1;
          if (onTick) onTick(newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onTick]);

  return <>{formatTime(time)}</>;
}
