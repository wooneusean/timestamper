import { DeleteIcon } from '@chakra-ui/icons';
import { TiArrowForward } from 'react-icons/ti';
import { Box, IconButton, Input } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef } from 'react';
import {
  TimestamperActionKind,
  TimestamperContext,
  TimestampEvent,
  timestampIsEqual,
  TimestampTime,
} from '../../pages';

import styles from './timestamper.module.scss';

const Timestamp: React.FC<{ timestampEvent: TimestampEvent }> = ({ timestampEvent }) => {
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

    if (timestampIsEqual(timestampEvent.timestamp, newTimestamp)) return;

    dispatch({
      type: TimestamperActionKind.UPDATE_TIMESTAMP_TIME,
      payload: { timestampEvent, newTimestamp },
    });
  };

  useEffect(() => {
    if (document.activeElement.tagName !== 'INPUT') {
      eventInputRef.current.focus();
    }
  }, [state.timestampList]);

  useEffect(() => {
    hrRef.current.value = timestampEvent.timestamp.hours.toString().padStart(2, '0');
    minRef.current.value = timestampEvent.timestamp.minutes.toString().padStart(2, '0');
    secRef.current.value = timestampEvent.timestamp.seconds.toString().padStart(2, '0');
  }, [timestampEvent]);

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
          onBlur={(e) => {
            onTimestampChange(e, 'hours');
          }}
        />
        <Input
          ref={minRef}
          min='0'
          max='59'
          type='number'
          onBlur={(e) => {
            onTimestampChange(e, 'minutes');
          }}
        />
        <Input
          ref={secRef}
          min='0'
          max='59'
          type='number'
          onBlur={(e) => {
            onTimestampChange(e, 'seconds');
          }}
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
