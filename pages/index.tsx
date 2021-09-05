import React, { useContext, useReducer } from 'react';
import TimestamperRoot from '../components/Timestamper/TimestamperRoot';
import { secondsToTimestamp, timestampToSeconds } from '../components/Timestamper/utilities';

export interface TimestampTime {
  actualSeconds: number;
  hours: string;
  minutes: string;
  seconds: string;
}

export const timestampIsEqual = (timestamp1: TimestampTime, timestamp2: TimestampTime) => {
  return (
    timestamp1.hours === timestamp2.hours &&
    timestamp1.minutes === timestamp2.minutes &&
    timestamp1.seconds === timestamp2.seconds
  );
};

export interface TimestampEvent {
  timestamp: TimestampTime;
  event: string;
}

export interface TimestamperSettings {
  timeOffset: number;
}

export interface TimestamperState {
  timestampList: TimestampEvent[];
  videoHasErrors: boolean;
  videoId: string;
  player: any;
  isPlayerReady: boolean;
  timestamperSettings: TimestamperSettings;
}

export const TimestamperContext = React.createContext<{
  state: TimestamperState;
  dispatch: React.Dispatch<TimestamperAction>;
}>(null);

const initialState: TimestamperState = {
  timestampList: null,
  videoHasErrors: false,
  videoId: null,
  player: null,
  isPlayerReady: false,
  timestamperSettings: {
    timeOffset: 5,
  },
};

export enum TimestamperActionKind {
  SET_VIDEO_ID,
  SET_VIDEO_HAS_ERRORS,
  ADD_TIMESTAMP,
  REMOVE_TIMESTAMP,
  CLEAR_TIMESTAMPS,
  SET_TIMESTAMPER_SETTINGS,
  UPDATE_TIMESTAMP_EVENT,
  UPDATE_TIMESTAMP_TIME,
  SET_PLAYER,
  SET_PLAYER_READY,
  SET_TIMESTAMP_LIST,
}

export interface TimestamperAction {
  type: TimestamperActionKind;
  payload: any;
}

const reducer = (state: TimestamperState, action: TimestamperAction): TimestamperState => {
  switch (action.type) {
    case TimestamperActionKind.SET_VIDEO_ID: {
      return {
        ...state,
        videoId: action.payload,
        videoHasErrors: false,
      };
    }

    case TimestamperActionKind.SET_VIDEO_HAS_ERRORS: {
      return {
        ...state,
        videoHasErrors: action.payload,
      };
    }

    case TimestamperActionKind.ADD_TIMESTAMP: {
      const newTimestamp: TimestampEvent = {
        timestamp: secondsToTimestamp(state.player.getCurrentTime() - state.timestamperSettings.timeOffset),
        event: action.payload,
      };
      return {
        ...state,
        timestampList: [...state.timestampList, newTimestamp],
      };
    }

    case TimestamperActionKind.REMOVE_TIMESTAMP: {
      const newTimestampList = [...state.timestampList];
      newTimestampList.splice(state.timestampList.indexOf(action.payload), 1);

      return {
        ...state,
        timestampList: [...newTimestampList],
      };
    }

    case TimestamperActionKind.CLEAR_TIMESTAMPS: {
      return {
        ...state,
        timestampList: [],
      };
    }

    case TimestamperActionKind.SET_TIMESTAMPER_SETTINGS: {
      return {
        ...state,
        timestamperSettings: action.payload,
      };
    }

    case TimestamperActionKind.UPDATE_TIMESTAMP_EVENT: {
      const { timestampEvent, newValue } = action.payload;
      const newTimestampList = state.timestampList.map((timestamp) => {
        if (timestamp === timestampEvent) {
          return { ...timestamp, event: newValue };
        }
        return timestamp;
      });

      return {
        ...state,
        timestampList: newTimestampList,
      };
    }

    case TimestamperActionKind.UPDATE_TIMESTAMP_TIME: {
      const {
        timestampEvent,
        newTimestamp,
      }: {
        timestampEvent: TimestampEvent;
        newTimestamp: TimestampTime;
      } = action.payload;

      newTimestamp.actualSeconds = timestampToSeconds(newTimestamp);

      const newTimestampList = state.timestampList.map((ts): TimestampEvent => {
        if (ts === timestampEvent) {
          return { ...ts, timestamp: newTimestamp };
        }
        return ts;
      });

      return {
        ...state,
        timestampList: newTimestampList,
      };
    }

    case TimestamperActionKind.SET_PLAYER: {
      return {
        ...state,
        player: action.payload,
      };
    }

    case TimestamperActionKind.SET_PLAYER_READY: {
      return {
        ...state,
        isPlayerReady: action.payload,
      };
    }

    case TimestamperActionKind.SET_TIMESTAMP_LIST: {
      return {
        ...state,
        timestampList: action.payload,
      };
    }

    default: {
      return state;
    }
  }
};

const Timestamper = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <TimestamperContext.Provider value={{ state, dispatch }}>
      <TimestamperRoot />
    </TimestamperContext.Provider>
  );
};

export default Timestamper;
