# mini-throttle

This is a package which provides `throttle` and `debounce` functions, with both
flow and TypeScript declarations, and a minimal code footprint (less than 60
lines, less than 350 bytes minified+gzipped)


### throttling, debouncing, and everything inbetween

```js
type ThrottleOptions = {
  start?: boolean, // fire immediately on the first call
  middle?: boolean, // if true, fire as soon as `wait` has passed
  once?: boolean, // cancel after the first successful call
}
function throttle<T>(
  callback: (...args: T[]) => any,
  wait: number,
  opts?: ThrottleOptions
): (...args: T[]) => void

function debounce<T>(
  callback: (...args: T[]) => any,
  wait: number,
  opts?: ThrottleOptions
): (...args: T[]) => void
```

This package comes with two functions; `throttle` and `debounce`.

Both of these functions offer the exact same signature, because they're both
the same function - just with different `opts` defaults:

 - `throttle` opts default to `{ start: true, middle: true, once: false }`.
 - `debounce` opts default to `{ start: false, middle: false, once: false }`.

Each of the options changes when `callback` gets called. The best way to
illustrate this is with a marble diagram.

```js
for (let i = 1; i <= 10; ++i) {
  fn(i)
  await delay(50)
}
await delay(100)
```
```
| fn()                                         | 1 2 3 4 5 6 7 8 9 10 |
| throttle(fn, 100)                            | 1 2   4   6   8   10 |
| throttle(fn, 100, {start: false})            |   2   4   6   8   10 |
| throttle(fn, 100, {middle: false})           | 1                 10 |
| throttle(fn, 100, {once: true})              | 1                    |
| throttle(fn, 100, {once: true, start: false})|   2                  |
| debounce(fn, 100)                            |                   10 |
```

### TypeScript Decorators Support!

This package also includes a decorator module which can be used to provide [TypeScript Decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#decorators) annotations to functions.

Here's an example, showing what you need to do:

```typescript
import {throttle} from '@github/mini-throttle/decorators'
//                                           ^ note: add `/decorators` to the import to get decorators

class MyClass {
  @throttle(100, { start: false }) // <- Just like normal throttle, but you omit the callback argument
  doThings() {
    // `MyClass.prototype.doThings` will be throttled!
  }
}
```
