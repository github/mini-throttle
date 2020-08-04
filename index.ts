export interface ThrottleOptions {
  /**
   * Fire immediately on the first call.
   */
  start?: boolean
  /**
   * Fire as soon as `wait` has passed.
   */
  middle?: boolean
  /**
   * Cancel after the first successful call.
   */
  once?: boolean
}

interface Throttler<T extends unknown[]> {
  (...args: T): void
  cancel(): void
}

const currentTargets = new WeakMap<Event, Element>()

export function throttle<T extends unknown[]>(
  callback: (...args: T) => unknown,
  wait = 0,
  {start = true, middle = true, once = false}: ThrottleOptions = {}
): Throttler<T> {
  let last = 0
  let timer: number | undefined
  let cancelled = false
  function fn(this: unknown, ...args: T) {
    if (cancelled) return

    // Cache the `currentTarget` if we are throttling a event handler.
    if (args[0] instanceof Event) {
      const ev = args[0]
      currentTargets.set(ev, ev.currentTarget as Element)

      Object.defineProperty(ev, 'currentTarget', {
        get(this: Event) {
          return currentTargets.get(this)
        },
      })
    }

    const delta = Date.now() - last
    last = Date.now()
    if (start) {
      start = false
      callback.apply(this, args)
      if (once) fn.cancel()
    } else if ((middle && delta < wait) || !middle) {
      clearTimeout(timer)
      timer = setTimeout(
        () => {
          last = Date.now()
          callback.apply(this, args)
          if (once) fn.cancel()
        },
        !middle ? wait : wait - delta
      )
    }
  }
  fn.cancel = () => {
    clearTimeout(timer)
    cancelled = true
  }
  return fn
}

export function debounce<T extends unknown[]>(
  callback: (...args: T) => unknown,
  wait = 0,
  {start = false, middle = false, once = false}: ThrottleOptions = {}
): Throttler<T> {
  return throttle(callback, wait, {start, middle, once})
}
