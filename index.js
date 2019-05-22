/* @flow strict */

type ThrottleOptions = {|
  start?: boolean,
  middle?: boolean,
  once?: boolean
|}
export function throttle<T: $ReadOnlyArray<mixed>>(
  callback: (...T) => mixed,
  wait: number = 0,
  {start = true, middle = true, once = false}: ThrottleOptions = {}
): (...T) => void {
  let last = 0
  let timer
  let cancelled = false
  const fn = (...args) => {
    if (cancelled) return
    const delta = Date.now() - last
    last = Date.now()
    if (start) {
      //eslint-disable-next-line flowtype/no-flow-fix-me-comments
      // $FlowFixMe this isn't a const
      start = false
      callback(...args)
      if (once) fn.cancel()
    } else if ((middle && delta < wait) || !middle) {
      clearTimeout(timer)
      timer = setTimeout(
        () => {
          last = Date.now()
          callback(...args)
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

export function debounce<T: $ReadOnlyArray<mixed>>(
  callback: (...T) => mixed,
  wait: number = 0,
  {start = false, middle = false, once = false}: ThrottleOptions = {}
): (...T) => void {
  return throttle(callback, wait, {start, middle, once})
}
