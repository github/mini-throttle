import {throttle, debounce} from '../index'

throttle(() => {})
throttle(() => {}, 100)
throttle(() => {}, 100, {})
throttle(() => {}, 100, {start: false})
throttle(() => {}, 100, {middle: false})
debounce(() => {}, 100)
debounce(() => {}, 100, {start: false})
debounce(() => {}, 100, {middle: false})

const throttled = throttle(() => {})
 // no args, returns void
const result: void = throttled()
console.log(result)
 // no args, returns void
const result2: void = throttled.cancel()
console.log(result2)

const throttledWithArgs = throttle((n: number, t: string) => t.slice(n))
// needs args of number and string, returns void
const result3: void = throttledWithArgs(1, '123')
console.log(result3)
 // no args, returns void
const result4: void = throttledWithArgs.cancel()
console.log(result4)
