export type ThrottleOptions = {
  start?: boolean,
  middle?: boolean,
  once?: boolean
}
export function throttle<T>(
  callback: (...args: T[]) => any,
  wait: number,
  opts?: ThrottleOptions
): (...args: T[]) => void

export function debounce<T>(
  callback: (...args: T[]) => any,
  wait: number,
  opts?: ThrottleOptions
): (...args: T[]) => void
