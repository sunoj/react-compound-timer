import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Unit,
  Checkpoints,
  TimeParts,
  Direction,
  TimerValue,
} from '../types';
import { TimerModel } from '../lib/models/TimerModel';
import getTimeParts from "src/lib/helpers/getTimeParts";

interface TimerOptions {
  initialTime: number;
  direction: "forward" | "backward";
  timeToUpdate: number;
  startImmediately: boolean;
  lastUnit: Unit;
  checkpoints: Checkpoints;
  formatValue: (value: number) => string;
  onStart: () => void;
  onResume: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function useTimer({
  initialTime = 0,
  direction = "forward",
  timeToUpdate = 1000,
  startImmediately = true,
  lastUnit = "d",
  checkpoints = [],
  onStart,
  onResume,
  onPause,
  onStop,
  onReset,
}: Partial<TimerOptions> = {}) {
  const [timerValues, setTimerValues] = useState<TimerValue>({
    ...getTimeParts(initialTime, lastUnit),
    state: 'INITED',
  });

  const timer = useMemo(
    () =>
      new TimerModel({
        initialTime,
        direction,
        timeToUpdate,
        lastUnit,
        checkpoints,
        onChange: (timerValue: TimerValue) =>
          setTimerValues(state => ({ ...state, ...timerValue })),
      }),
    [],
  );

  const setTime = useCallback((time: number) => timer.setTime(time), [timer]);
  const getTime = useCallback(() => timer.getTime(), [timer]);

  const getTimerState = useCallback(() => timer.state, [timer]);

  const setDirection = useCallback(
    (direction: Direction) => timer.setDirection(direction),
    [timer],
  );

  const setCheckpoints = useCallback(
    (checkpoints: Checkpoints) => timer.setCheckpoints(checkpoints),
    [timer],
  );

  const start = useCallback(() => { timer.start(); onStart && onStart(); }, [timer, onStart]);
  const stop = useCallback(() => { timer.stop(); onStop && onStop(); }, [timer, onStop]);
  const pause = useCallback(() => { timer.pause(); onPause && onPause(); }, [timer, onPause]);
  const reset = useCallback(() => { timer.reset(); onReset && onReset(); }, [timer, onReset]);
  const resume = useCallback(() => { timer.reset(); onResume && onResume(); }, [timer, onResume]);

  const controls = useMemo(
    () => ({
      start,
      stop,
      pause,
      reset,
      resume,
      setTime,
      getTime,
      getTimerState,
      setDirection,
      setCheckpoints,
    }),
    [
      start, stop, pause, reset, resume,
      setTime, getTime, getTimerState, setDirection, setCheckpoints,
    ],
  );

  useEffect(
    () => {
      if (startImmediately) {
        start();
      }

      return () => {
        stop();
      };
    },
    [],
  );

  return {
    controls,
    value: timerValues,
  };
}