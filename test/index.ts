import {throttle, debounce} from '../index'
import {throttle as decoratorThrottle, debounce as decoratorDebounce} from '../decorators'
import {beforeEach, describe, it, vi, expect} from 'vitest'

interface Throttler<T extends unknown[]> {
  (...args: T): void
  cancel(): void
}

let calls: unknown[] = []
let fn: Throttler<unknown[]>

beforeEach(() => {
  fn?.cancel?.()
  calls = []
  vi.useFakeTimers()
})
describe('throttle', () => {
  beforeEach(() => {
    fn = throttle((...xs) => calls.push(xs), 100)
  })
  it('fires callback immediately', () => {
    fn()
    expect(calls).toHaveLength(1)
  })

  it('calls callback with given arguments', () => {
    fn(1, 2, 3)
    expect(calls).toEqual([[1, 2, 3]])
  })

  it('fires once `wait` ms have passed', () => {
    fn(1)
    vi.advanceTimersByTime(50)
    fn(2)
    vi.advanceTimersByTime(50)
    fn(3)
    vi.advanceTimersByTime(50)
    fn(4)
    vi.advanceTimersByTime(100) // wait for end

    // start: 1; middle: 3; end: 4
    expect(calls).toEqual([[1], [3], [4]])
  })

  it('will fire last call after `wait` ms have passed', () => {
    fn(1)
    fn(2)
    fn(3)
    vi.advanceTimersByTime(150)
    expect(calls).toEqual([[1], [3]])
  })

  it('will fire even the passed time greater than `wait` ms', () => {
    fn(1)
    vi.advanceTimersByTime(200)
    fn(2)
    fn(3)
    fn(4)
    vi.advanceTimersByTime(1000)
    fn(5)
    expect(calls).toEqual([[1], [2], [4], [5]])
  })

  it('calls callback with given arguments (middle)', () => {
    fn(1, 2, 3)
    fn(4, 5, 6)
    fn(7, 8, 9)
    fn(10, 11, 12)
    vi.advanceTimersByTime(150)
    expect(calls).toEqual([
      [1, 2, 3],
      [10, 11, 12]
    ])
  })

  it('can be cancelled with cancel()', () => {
    fn.cancel()
    fn(1, 2, 3)
    fn(4, 5, 6)
    fn(7, 8, 9)
    fn(10, 11, 12)
    vi.advanceTimersByTime(100)
    expect(calls).toEqual([])
  })

  it('exposes `this`', () => {
    fn = throttle(function (this: unknown) {
      calls.push(this)
    }, 100)
    const receiver = {}
    fn.call(receiver, 1)
    expect(calls).toEqual([receiver])
  })
})

describe('throttle {start:false}', () => {
  beforeEach(() => {
    fn = throttle((...xs) => calls.push(xs), 100, {start: false})
  })
  it('does not fire callback immediately', () => {
    fn()
    expect(calls).toHaveLength(0)
  })
})

describe('throttle {middle:false}', () => {
  beforeEach(() => {
    fn = throttle((...xs) => calls.push(xs), 100, {middle: false})
  })

  it('fires first callback', () => {
    fn(1)
    expect(calls).toEqual([[1]])
  })

  it('does not fire if `wait` ms have passed', () => {
    fn(1)
    vi.advanceTimersByTime(50)
    fn(2)
    vi.advanceTimersByTime(50)
    fn(3)
    vi.advanceTimersByTime(50)
    fn(4)
    expect(calls).toEqual([[1]])
  })
})

describe('throttle {end:false}', () => {
  beforeEach(() => {
    fn = throttle((...xs) => calls.push(xs), 100, {end: false})
  })

  it('fires first callback', () => {
    fn(1)
    expect(calls).toEqual([[1]])
  })

  it('does not fire fast second callback even after `wait` ms passes', () => {
    fn(1)
    vi.advanceTimersByTime(50)
    fn(2)
    vi.advanceTimersByTime(100)
    expect(calls).toEqual([[1]])
  })

  it('still fires middle callback during sequence', () => {
    fn(1)
    vi.advanceTimersByTime(50)
    fn(2)
    vi.advanceTimersByTime(50)
    fn(3)
    vi.advanceTimersByTime(50)
    fn(4)

    // start: 1; middle: 2; no end
    expect(calls).toEqual([[1], [3]])
  })
})

describe('debounce (throttle with {start: false, middle: false})', () => {
  beforeEach(() => {
    fn = debounce((...xs) => calls.push(xs), 100)
  })

  it('does not fire callback immediately', () => {
    fn()
    expect(calls).toHaveLength(0)
  })

  it('only fires once `wait` ms have passed without any calls', () => {
    fn(1)
    fn(2)
    fn(3)
    vi.advanceTimersByTime(100)
    expect(calls).toEqual([[3]])
  })

  it('will fire even the passed time greater than `wait` ms', () => {
    fn(1)
    vi.advanceTimersByTime(200)
    fn(2)
    fn(3)
    fn(4)
    vi.advanceTimersByTime(1000)
    fn(5)
    expect(calls).toEqual([[1], [4]])
  })

  it('exposes `this`', () => {
    fn = debounce(function (this: unknown) {
      calls.push(this)
    }, 100)
    const receiver = {}
    fn.call(receiver, 1)
    vi.advanceTimersByTime(100)
    expect(calls).toEqual([receiver])
  })
})

describe('marbles', () => {
  const loop = (cb: (n: number) => void) => {
    for (let i = 1; i <= 10; ++i) {
      cb(i)
      // Things are clearer when the interval is not an exact divisor of the throttle time (at which point middle calls
      // start conflicting and being less obvious/predictable)
      vi.advanceTimersByTime(50)
    }
    vi.advanceTimersByTime(100)
  }

  it('fn', () => {
    loop((x: number) => calls.push(x))
    expect(calls).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it.each([
    [{start: true, middle: true, end: true}, [1, 3, 5, 7, 9, 10]],
    [{start: true, middle: true, end: false}, [1, 3, 5, 7, 9]],
    [{start: true, middle: false, end: true}, [1, 10]],
    [{start: true, middle: false, end: false}, [1]],
    [{start: false, middle: true, end: true}, [3, 5, 7, 9, 10]],
    [{start: false, middle: true, end: false}, [3, 5, 7, 9]],
    [{start: false, middle: false, end: true}, [10]],
    [{start: false, middle: false, end: false}, []],
    [{}, [1, 3, 5, 7, 9, 10]]
  ])('throttle(fn, 100, %s)', (opts, expected) => {
    loop(throttle(x => calls.push(x), 100, opts))
    expect(calls).toEqual(expected)
  })

  it('debounce(fn, 100)', () => {
    loop(debounce(x => calls.push(x), 100))
    expect(calls).toEqual([10])
  })
})

describe('decorators', () => {
  const loop = async (cb: (n: number) => void) => {
    for (let i = 1; i <= 10; ++i) {
      cb(i)
      vi.advanceTimersByTime(50)
    }
    vi.advanceTimersByTime(100)
  }

  describe('throttle', () => {
    it('wraps decorated function as throttle', () => {
      class MyClass {
        @decoratorThrottle(100)
        foo(x: number) {
          calls.push(x)
        }
      }
      const instance = new MyClass()
      loop(x => instance.foo(x))
      expect(calls).toEqual([1, 3, 5, 7, 9, 10])
    })
  })

  describe('debounce', () => {
    it('wraps decorated function as throttle', () => {
      class MyClass {
        @decoratorDebounce(100)
        foo(x: number) {
          calls.push(x)
        }
      }
      const instance = new MyClass()
      loop(x => instance.foo(x))
      expect(calls).toEqual([10])
    })
  })
})
