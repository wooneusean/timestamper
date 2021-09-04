import { TimestampTime } from '../../pages';

export const secondsToTimestamp = (timestamp: number): TimestampTime => {
  if (timestamp <= 0) return { actualSeconds: 0, hours: '00', minutes: '00', seconds: '00' };

  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp % 3600) / 60);
  const seconds = Math.floor(timestamp % 60);

  return {
    actualSeconds: timestamp,
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
};

export const timestampToSeconds = (timestamp: TimestampTime): number => {
  return parseInt(timestamp.hours) * 60 * 60 + parseInt(timestamp.minutes) * 60 + parseInt(timestamp.seconds);
};
