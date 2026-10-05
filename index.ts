export interface ThrottleOptions {
  /**
   * Fire at the start of a sequence of calls.
   */
  start?: boolean
  /**
   * Fire in the middle of a sequence of calls when `wait` has passed.
   */
  middle?: boolean
  /**
   * Fire at the end of a sequence of calls.
   */
  end?: boolean
  /**
   * Cancel after the first successful call. Will never call again.
   */
  once?: boolean
}

interface Throttler<T extends unknown[]> {
  (...args: T): void
  /** Cancel any pending calls and never call the function again. */
  cancel(): void
}

export function throttle<T extends unknown[]>(
  callback: (...args: T) => unknown,
  wait = 0,
  {start = true, middle = true, once = false, end = true}: ThrottleOptions = {}
): Throttler<T> {
  /** Time of last made call in this sequence, or time of start of sequence if a call hasn't been made yet. */
  let lastCall = 0
  let lastAttempt = 0
  let endTimer: ReturnType<typeof setTimeout>
  let cancelled = false

  function fn(this: unknown, ...args: T) {
    if (cancelled) return

    const makeCall = () => {
      clearTimeout(endTimer)
      lastCall = Date.now()
      callback.apply(this, args)
      if (once) fn.cancel()
    }

    const queueCall = (delay: number) => {
      clearTimeout(endTimer)
      endTimer = setTimeout(() => makeCall(), delay)
    }

    const isStartOfSequence = Date.now() - lastAttempt >= wait
    lastAttempt = Date.now()

    if (isStartOfSequence) lastCall = Date.now()

    // start: If it has been a sufficient time since the last attempt, start a new sequence
    if (start && isStartOfSequence) {
      makeCall()
      return
    }

    // If middle and end are both enabled, we can queue them the same way. This ensures even spacing; calls are made
    // exactly every `wait` ms during the sequence. Mimics Lodash style throttle.
    if (middle && end) {
      const remainingWait = wait - (Date.now() - lastCall)
      if (remainingWait <= 0) {
        makeCall()
      } else {
        // +1 ms ensures that if a call is attempted at exactly the same time as the queued call would be made,
        // the requested call will win over the queued call.
        queueCall(remainingWait + 1)
      }
      return
    }

    // If middle is disabled (something Lodash doesn't support), we have to wait the full interval for the end call.
    // This is because we don't know if another call will be made unless we wait until the sequence is definitely over.
    if (!middle && end) {
      queueCall(wait)
      return
    }

    // If middle is enabled but end is disabled, we cannot make the middle call until another call is made - if we
    // optimistically make a call as soon as `wait` is over, it will look like an `end` call which would violate the end setting.
    if (middle && !end) {
      if (Date.now() - lastCall >= wait) makeCall()
      return
    }
  }

  fn.cancel = () => {
    clearTimeout(endTimer)
    cancelled = true
  }

  return fn
}

// debounce is just throttle but with only an ending call
export function debounce<T extends unknown[]>(
  callback: (...args: T) => unknown,
  wait = 0,
  {start = false, middle = false, once = false, end = true}: ThrottleOptions = {}
): Throttler<T> {
  return throttle(callback, wait, {start, middle, once, end})
}
