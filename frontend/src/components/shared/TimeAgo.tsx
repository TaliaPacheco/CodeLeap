import { useEffect, useState } from 'react';
import { timeAgo } from '../../utils/time';

interface TimeAgoProps {
  date: string;
  className?: string;
}

export default function TimeAgo({ date, className = '' }: TimeAgoProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return <span className={className}>{timeAgo(date)}</span>;
}
