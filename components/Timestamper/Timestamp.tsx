import { DeleteIcon } from '@chakra-ui/icons';
import { TiArrowForward } from 'react-icons/ti';
import { Box, IconButton, Input } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { TimestampEvent, TimestampTime } from '../../pages';

import styles from '../../pages/timestamper.module.scss';

const Timestamp: React.FC<{
  timestampEvent: TimestampEvent;
  timestampList: TimestampEvent[];
  player: any;
  isFocused?: boolean;
  setTimestampList: React.Dispatch<React.SetStateAction<TimestampEvent[]>>;
  addNewTimestamp: () => void;
}> = ({ timestampEvent, timestampList, player, isFocused, setTimestampList, addNewTimestamp }) => {
  const eventInputRef = useRef<HTMLInputElement>(null);
  const hrRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const secRef = useRef<HTMLInputElement>(null);

  const changeTimestampEvent = (e: React.FormEvent<HTMLInputElement>) => {
    const newTimestampList = [...timestampList];
    newTimestampList[timestampList.indexOf(timestampEvent)] = {
      ...timestampEvent,
      event: e.currentTarget.value,
    };
    setTimestampList(newTimestampList);
  };

  const removeTimestampEvent = () => {
    const newTimestampList = [...timestampList];
    newTimestampList.splice(timestampList.indexOf(timestampEvent), 1);
    setTimestampList(newTimestampList);
  };

  const handleEscapeKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      removeTimestampEvent();
    }
  };

  const jumpToTimestamp = () => {
    player.seekTo(timestampEvent.timestamp.actualSeconds);
  };

  const onHourChanged = (e) => {
    const newTimestampList = [...timestampList];
    newTimestampList[timestampList.indexOf(timestampEvent)].timestamp.hours = e.target.value.padStart(2, '0');
    updateTimestamp(newTimestampList);
  };

  const onMinuteChanged = (e) => {
    const newTimestampList = [...timestampList];
    newTimestampList[timestampList.indexOf(timestampEvent)].timestamp.minutes = e.target.value.padStart(2, '0');
    updateTimestamp(newTimestampList);
  };

  const onSecondChanged = (e) => {
    const newTimestampList = [...timestampList];
    newTimestampList[timestampList.indexOf(timestampEvent)].timestamp.seconds = e.target.value.padStart(2, '0');
    updateTimestamp(newTimestampList);
  };

  const updateTimestamp = (newTimestampList: TimestampEvent[]) => {
    const newTimestampEvent = newTimestampList[timestampList.indexOf(timestampEvent)];
    newTimestampEvent.timestamp.actualSeconds = timestampToSeconds(newTimestampEvent.timestamp);

    setTimestampList(newTimestampList);
  };

  const timestampToSeconds = (timestamp: TimestampTime): number => {
    return parseInt(timestamp.hours) * 60 * 60 + parseInt(timestamp.minutes) * 60 + parseInt(timestamp.seconds);
  };

  useEffect(() => {
    if (isFocused) {
      eventInputRef.current?.focus();
    }
  }, []);

  return (
    <Box className={styles.timestampEvent} display='flex'>
      <IconButton
        variant='ghost'
        marginRight='0.5rem'
        aria-label='Jump to this timestamp'
        icon={<TiArrowForward size='2rem' />}
        borderRadius='5px'
        colorScheme='blue'
        onClick={jumpToTimestamp}
      />
      <Box flex='0 1 32%' display='flex' className={styles.timestamp}>
        <Input
          ref={hrRef}
          min='0'
          max='59'
          type='number'
          onInput={onHourChanged}
          value={timestampEvent.timestamp.hours}
        />
        <Input
          ref={minRef}
          min='0'
          max='59'
          type='number'
          onInput={onMinuteChanged}
          value={timestampEvent.timestamp.minutes}
        />
        <Input
          ref={secRef}
          min='0'
          max='59'
          type='number'
          onInput={onSecondChanged}
          value={timestampEvent.timestamp.seconds}
        />
      </Box>
      <Box fontSize='24' style={{ paddingInline: '0.5rem' }}>
        :
      </Box>
      <Box flex='0 1 68%'>
        <Input
          ref={eventInputRef}
          type='text'
          placeholder='Something cool happened...'
          onInput={changeTimestampEvent}
          value={timestampEvent.event}
          onKeyDown={handleEscapeKeydown}
        />
      </Box>
      <IconButton
        variant='ghost'
        marginLeft='0.5rem'
        aria-label='Delete this timestamp'
        icon={<DeleteIcon />}
        borderRadius='5px'
        colorScheme='red'
        onClick={removeTimestampEvent}
      />
    </Box>
  );
};

export default Timestamp;
