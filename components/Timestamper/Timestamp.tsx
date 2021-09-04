import { DeleteIcon } from '@chakra-ui/icons';
import { TiArrowForward } from 'react-icons/ti';
import { Box, IconButton, Input } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef } from 'react';
import { TimestamperActionKind, TimestamperContext, TimestampEvent, TimestampTime } from '../../pages';

import styles from './timestamper.module.scss';

const Timestamp: React.FC<{
  timestampEvent: TimestampEvent;
  isFocused: boolean;
}> = ({ timestampEvent, isFocused }) => {
  const { state, dispatch } = useContext(TimestamperContext);

  const eventInputRef = useRef<HTMLInputElement>(null);
  const hrRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const secRef = useRef<HTMLInputElement>(null);

  const changeTimestampEvent = (e: React.FormEvent<HTMLInputElement>) => {
    dispatch({
      type: TimestamperActionKind.UPDATE_TIMESTAMP_EVENT,
      payload: { timestampEvent, newValue: e.currentTarget.value },
    });
  };

  const removeTimestamp = () => {
    dispatch({
      type: TimestamperActionKind.REMOVE_TIMESTAMP,
      payload: timestampEvent,
    });
  };

  const handleEscapeKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      removeTimestamp();
    }
  };

  const jumpToTimestamp = () => {
    state.player.seekTo(timestampEvent.timestamp.actualSeconds);
  };

  const onTimestampChange = (e: React.FormEvent<HTMLInputElement>, unit: 'hours' | 'minutes' | 'seconds') => {
    const newTimestamp = { ...timestampEvent.timestamp };
    newTimestamp[unit] = parseInt(e.currentTarget.value, 10).toString();
    dispatch({
      type: TimestamperActionKind.UPDATE_TIMESTAMP_TIME,
      payload: { timestampEvent, newTimestamp },
    });
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
          onInput={(e) => {
            onTimestampChange(e, 'hours');
          }}
          value={timestampEvent.timestamp.hours}
        />
        <Input
          ref={minRef}
          min='0'
          max='59'
          type='number'
          onInput={(e) => {
            onTimestampChange(e, 'minutes');
          }}
          value={timestampEvent.timestamp.minutes}
        />
        <Input
          ref={secRef}
          min='0'
          max='59'
          type='number'
          onInput={(e) => {
            onTimestampChange(e, 'seconds');
          }}
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
        onClick={removeTimestamp}
      />
    </Box>
  );
};

export default Timestamp;
