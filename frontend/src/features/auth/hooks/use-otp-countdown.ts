"use client";

import * as React from "react";
import { toPersianDigits } from "@/shared/lib/utils";

export interface UseOtpCountdownOptions {
  initialSeconds?: number;
  autoStart?: boolean;
}

export function useOtpCountdown({
  initialSeconds = 120,
  autoStart = true,
}: UseOtpCountdownOptions = {}) {
  const [secondsLeft, setSecondsLeft] = React.useState<number>(initialSeconds);
  const [isActive, setIsActive] = React.useState<boolean>(autoStart);

  React.useEffect(() => {
    if (!isActive) return;

    if (secondsLeft <= 0) {
      setIsActive(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, secondsLeft]);

  const start = React.useCallback((seconds: number = initialSeconds) => {
    setSecondsLeft(seconds);
    setIsActive(true);
  }, [initialSeconds]);

  const reset = React.useCallback(() => {
    setSecondsLeft(initialSeconds);
    setIsActive(false);
  }, [initialSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSeconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
  const formattedPersianTime = toPersianDigits(formattedTime);

  return {
    secondsLeft,
    isActive,
    isFinished: secondsLeft === 0,
    formattedTime,
    formattedPersianTime,
    start,
    reset,
  };
}
