export type ThrottleOptions = {
  /**
   * Fire immediately on the first call.
   */
  start?: boolean
  /**
   * If true, fire as soon as `wait` has passed.
   */
  middle?: boolean
  /**
   * Cancel after the first successful call.
   */
  once?: boolean
}

export function throttle<T extends unknown[]>(
  callback: (...args: T) => unknown,
  wait?: number,
  opts?: ThrottleOptions
): ((...args: T) => void) & {cancel(): void}

export function debounce<T extends unknown[]>(
  callback: (...args: T) => unknown,
  wait?: number,
  opts?: ThrottleOptions
): ((...args: T) => void) & {cancel(): void}
