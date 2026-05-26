import { useEffect, useState } from 'react';

/**
 * Debounces a value, returning the latest value only after the specified
 * delay has elapsed without the value changing. Use this to prevent rapid
 * successive queries while the user is still typing.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
