import { useState, useRef, useEffect, useCallback } from "react";

/**
 * useTimer - A hook for managing a resend code timer with countdown.
 * @param initialSeconds Number of seconds for the timer (default: 60)
 */
export function useTimer(initialSeconds = 60) {
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setTimer(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [timer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return { timer, start };
}
