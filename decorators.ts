import {debounce as db, throttle as th, ThrottleOptions} from './index'

type Method = (this: unknown, ...args: never[]) => unknown

/**
 * The parts of a standard decorator's `ClassMethodDecoratorContext` used here. Declared structurally so these
 * types also load in TypeScript versions before 5.0, which lack the standard decorator types.
 */
export interface MethodDecoratorContext {
  readonly kind: 'method'
  readonly name: string | symbol
}

/**
 * A method decorator that works with both TypeScript's legacy `experimentalDecorators` and standard (TC39)
 * decorators.
 */
export interface DualMethodDecorator {
  <T extends Method>(method: T, context: MethodDecoratorContext): T
  (proto: object, name: string | symbol, descriptor: PropertyDescriptor): void
}

function methodDecorator(wrap: (fn: Method) => Method): DualMethodDecorator {
  return ((protoOrMethod: unknown, nameOrContext: unknown, descriptor?: PropertyDescriptor) => {
    // Standard decorators pass the method and a context object; legacy decorators pass the prototype, the
    // member name and its property descriptor.
    if (typeof nameOrContext === 'object' && nameOrContext !== null) {
      const context = nameOrContext as {kind?: unknown}
      if (context.kind !== 'method' || typeof protoOrMethod !== 'function') {
        throw new Error('debounce can only decorate functions')
      }
      return wrap(protoOrMethod as Method)
    }
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('debounce can only decorate functions')
    }
    descriptor.value = wrap(descriptor.value)
    Object.defineProperty(protoOrMethod, nameOrContext as string | symbol, descriptor)
    return undefined
  }) as DualMethodDecorator
}

export function throttle(wait = 0, opts: ThrottleOptions = {}): DualMethodDecorator {
  return methodDecorator(fn => th(fn, wait, opts))
}

export function debounce(wait = 0, opts: ThrottleOptions = {}): DualMethodDecorator {
  return methodDecorator(fn => db(fn, wait, opts))
}
