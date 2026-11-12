// Compile-time checks, run under both decorator modes: `tsc -p test/types` (experimentalDecorators) and
// `tsc -p test/standard` (standard decorators). Nothing here runs.
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

  @throttle(100)
  withReceiver(this: Example, x: number) {
    this.calls.push(x)
  }

  @debounce(100)
  static onResize() {}

  // @ts-expect-error fields are not methods
  @throttle(100)
  field = () => {}

  // @ts-expect-error getters are not methods
  @debounce(100)
  get value() {
    return 1
  }
}
