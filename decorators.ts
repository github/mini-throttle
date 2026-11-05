import {debounce as db, throttle as th, ThrottleOptions} from './index'

function decorateMethod(createWrapper: typeof th, wait = 0, opts: ThrottleOptions = {}): MethodDecorator {
  return (proto: unknown, name: string | symbol, descriptor: PropertyDescriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('debounce can only decorate functions')
    }
    const fn = descriptor.value
    const instances = new WeakMap<object, ReturnType<typeof th>>()
    delete descriptor.value
    delete descriptor.writable
    descriptor.get = function (this: object) {
      let wrapper = instances.get(this)
      if (!wrapper) {
        wrapper = createWrapper(fn, wait, opts)
        instances.set(this, wrapper)
      }
      return wrapper
    }
    descriptor.set = function (this: object, value: unknown) {
      Object.defineProperty(this, name, {
        value,
        writable: true,
        configurable: true,
        enumerable: true
      })
    }
    Object.defineProperty(proto, name, descriptor)
  }
}

export function throttle(wait = 0, opts: ThrottleOptions = {}): MethodDecorator {
  return decorateMethod(th, wait, opts)
}

export function debounce(wait = 0, opts: ThrottleOptions = {}): MethodDecorator {
  return decorateMethod(db, wait, opts)
}
