import {throttle, debounce} from '../index'
import {beforeEach, describe, it} from 'mocha'
import {expect} from 'chai'
const delay = (m: number) => new Promise((r) => setTimeout(r, m))

interface Throttler<T extends unknown[]> {
  (...args: T): void
  cancel(): void
}

let calls: unknown[] = []
let fn: Throttler<unknown[]>

beforeEach(() => {
  fn && fn.cancel && fn.cancel()
  calls = []
})
describe('throttle', () => {
  beforeEach(() => {
    fn = throttle((...xs) => calls.push(xs), 100)
  })
  it('fires callback immediately', async () => {
    fn()
    expect(calls).to.have.lengthOf(1)
  })

  it('calls callback with given arguments', async () => {
    fn(1, 2, 3)
    expect(calls).to.eql([[1, 2, 3]])
  })

  it('fires once `wait` ms have passed', async () => {
    fn(1)
    await delay(50)
    fn(2)
    await delay(50)
    fn(3)
    await delay(50)
    fn(4)
    expect(calls).to.eql([[1], [2]])
  })

  it('will fire last call after `wait` ms have passed', async () => {
    fn(1)
    fn(2)
    fn(3)
    await delay(100)
    expect(calls).to.eql([[1], [3]])
  })

  it('calls callback with given arguments (middle)', async () => {
    fn(1, 2, 3)
    fn(4, 5, 6)
    fn(7, 8, 9)
    fn(10, 11, 12)
    await delay(100)
    expect(calls).to.eql([
      [1, 2, 3],
      [10, 11, 12],
    ])
  })

  it('can be cancelled with cancel()', async () => {
    fn.cancel()
    fn(1, 2, 3)
    fn(4, 5, 6)
    fn(7, 8, 9)
    fn(10, 11, 12)
    await delay(100)
    expect(calls).to.eql([])
  })

  it('exposes `this`', async () => {
    fn = throttle(function (this: object) {
      calls.push(this)
    }, 100)
    const receiver = {}
    fn.call(receiver, 1)
    expect(calls).to.eql([receiver])
  })
})

describe('throttle {start:false}', () => {
  beforeEach(() => {
    fn = throttle((...xs) => calls.push(xs), 100, {start: false})
  })
  it('does not fire callback immediately', async () => {
    fn()
    expect(calls).to.have.lengthOf(0)
  })
})

describe('throttle {middle:false}', () => {
  beforeEach(() => {
    fn = throttle((...xs) => calls.push(xs), 100, {middle: false})
  })

  it('fires first callback', async () => {
    fn(1)
    expect(calls).to.eql([[1]])
  })

  it('does not fire if `wait` ms have passed', async () => {
    fn(1)
    await delay(50)
    fn(2)
    await delay(50)
    fn(3)
    await delay(50)
    fn(4)
    expect(calls).to.eql([[1]])
  })
})

describe('debounce (throttle with {start: false, middle: false})', () => {
  beforeEach(() => {
    fn = debounce((...xs) => calls.push(xs), 100)
  })

  it('does not fire callback immediately', async () => {
    fn()
    expect(calls).to.have.lengthOf(0)
  })

  it('only fires once `wait` ms have passed without any calls', async () => {
    fn(1)
    fn(2)
    fn(3)
    await delay(100)
    expect(calls).to.eql([[3]])
  })

  it('exposes `this`', async () => {
    fn = debounce(function (this: object) {
      calls.push(this)
    }, 100)
    const receiver = {}
    fn.call(receiver, 1)
    await delay(100)
    expect(calls).to.eql([receiver])
  })
})

describe('marbles', () => {
  const loop = async (cb: (n: number) => void) => {
    for (let i = 1; i <= 10; ++i) {
      cb(i)
      await delay(50)
    }
    await delay(100)
  }

  it('fn', async () => {
    await loop((x: number) => calls.push(x))
    expect(calls).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('throttle(fn, 100)', async () => {
    await loop(throttle((x) => calls.push(x), 100))
    expect(calls).to.eql([1, 2, 4, 6, 8, 10])
  })

  it('throttle(fn, 100, {start:false})', async () => {
    await loop(throttle((x) => calls.push(x), 100, {start: false}))
    expect(calls).to.eql([2, 4, 6, 8, 10])
  })

  it('throttle(fn, 100, {middle:false})', async () => {
    await loop(throttle((x) => calls.push(x), 100, {middle: false}))
    expect(calls).to.eql([1, 10])
  })

  it('debounce(fn, 100)', async () => {
    await loop(debounce((x) => calls.push(x), 100))
    expect(calls).to.eql([10])
  })
})
