// Type-checks standard (TC39) decorator usage. The main build and tests use `experimentalDecorators`.
import {debounce, throttle} from '../../decorators'

export class Example {
  calls: number[] = []

  @throttle(100)
  onScroll(x: number) {
    this.calls.push(x)
  }

  @debounce(100, {start: true})
  onInput(value: string): string {
    return value
  }
}
