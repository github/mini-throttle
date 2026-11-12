// Runs with standard (TC39) decorators: vitest.config.ts compiles test/standard with experimentalDecorators off.
import {debounce, throttle} from '../../decorators'
import {describe, it, expect} from 'vitest'
const delay = (m: number) => new Promise(r => setTimeout(r, m))

const loop = async (cb: (n: number) => void) => {
  for (let i = 1; i <= 10; ++i) {
    cb(i)
    await delay(50)
  }
  await delay(100)
}

describe('standard decorators', () => {
  it('throttles the method, keeping `this`', async () => {
    class MyClass {
      calls: number[] = []
      @throttle(100)
      foo(this: MyClass, x: number) {
        this.calls.push(x)
      }
    }
    const instance = new MyClass()
    await loop(x => instance.foo(x))
    expect(instance.calls).toEqual([1, 2, 4, 6, 8, 10])
  })

  it('debounces the method, keeping `this`', async () => {
    class MyClass {
      calls: number[] = []
      @debounce(100)
      foo(x: number) {
        this.calls.push(x)
      }
    }
    const instance = new MyClass()
    await loop(x => instance.foo(x))
    expect(instance.calls).toEqual([10])
  })

  it('decorates static and private methods', async () => {
    class MyClass {
      static calls: number[] = []
      calls: number[] = []
      @debounce(100)
      static foo(x: number) {
        MyClass.calls.push(x)
      }
      @debounce(100)
      #bar(x: number) {
        this.calls.push(x)
      }
      bar(x: number) {
        this.#bar(x)
      }
    }
    const instance = new MyClass()
    await loop(x => {
      MyClass.foo(x)
      instance.bar(x)
    })
    expect(MyClass.calls).toEqual([10])
    expect(instance.calls).toEqual([10])
  })

  it('shares one timer across instances', async () => {
    const calls: string[] = []
    class MyClass {
      constructor(private id: string) {}
      @debounce(100)
      foo() {
        calls.push(this.id)
      }
    }
    const a = new MyClass('a')
    const b = new MyClass('b')
    a.foo()
    b.foo()
    await delay(150)
    expect(calls).toEqual(['b'])
  })

  it('rejects members that are not methods', () => {
    // Class declarations, not expressions: oxc drops legacy decorators on class expressions.
    expect(() => {
      class Field {
        // @ts-expect-error fields are not methods
        @throttle(100)
        foo = () => {}
      }
      return Field
    }).toThrow('debounce can only decorate functions')
    expect(() => {
      class Getter {
        // @ts-expect-error getters are not methods
        @debounce(100)
        get foo() {
          return 1
        }
      }
      return Getter
    }).toThrow('debounce can only decorate functions')
  })
})
