import { useEffect, useState } from "react";

export function useHoldCountdown(expiresAt: string | null) {
  const [remainingMs, setRemainingMs] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      setExpired(false);
      return;
    }

    const tick = () => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      if (ms <= 0) {
        setRemainingMs(0);
        setExpired(true);
      } else {
        setRemainingMs(ms);
        setExpired(false);
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [expiresAt]);

  const seconds = Math.ceil(remainingMs / 1000);
  return { seconds, expired, remainingMs };
}
