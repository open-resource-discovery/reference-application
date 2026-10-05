import { Buffer } from 'buffer'

// The Explorer's AsyncAPI renderer includes avsc, which loads these Node.js modules at runtime.
// Provide the small browser-safe surface it needs until that dependency ships browser-native imports.
class EventEmitter {
  private events: Record<string, ((...args: unknown[]) => void)[]> = {}

  on(event: string, listener: (...args: unknown[]) => void): this {
    ;(this.events[event] ??= []).push(listener)
    return this
  }

  once(event: string, listener: (...args: unknown[]) => void): this {
    const wrapped = (...args: unknown[]): void => {
      this.off(event, wrapped)
      listener(...args)
    }
    return this.on(event, wrapped)
  }

  off(event: string, listener: (...args: unknown[]) => void): this {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((candidate) => candidate !== listener)
    }
    return this
  }

  emit(event: string, ...args: unknown[]): boolean {
    const listeners = this.events[event]?.slice() ?? []
    for (const listener of listeners) listener(...args)
    return listeners.length > 0
  }

  removeListener(event: string, listener: (...args: unknown[]) => void): this {
    return this.off(event, listener)
  }

  removeAllListeners(event?: string): this {
    if (event) delete this.events[event]
    else this.events = {}
    return this
  }

  listenerCount(event: string): number {
    return this.events[event]?.length ?? 0
  }
}

class Transform extends EventEmitter {
  readable = true
  writable = true

  constructor(_options?: unknown) {
    super()
  }

  push(_chunk: unknown): boolean {
    return true
  }

  write(_chunk: unknown, _encoding?: unknown, callback?: () => void): boolean {
    callback?.()
    return true
  }

  end(_chunk?: unknown, _encoding?: unknown, callback?: () => void): this {
    callback?.()
    this.emit('finish')
    return this
  }

  pipe<T>(destination: T): T {
    return destination
  }

  destroy(_error?: unknown): this {
    return this
  }

  read(_size?: number): null {
    return null
  }
}

const utilShim = {
  debuglog: (_name: string) => (..._args: unknown[]): void => {},
  format(format: string, ...args: unknown[]): string {
    let index = 0
    return String(format).replace(/%[sdj%]/g, (token) => {
      if (token === '%%') return '%'
      if (index >= args.length) return token
      const value = args[index++]
      if (token === '%d') return String(Number(value))
      if (token === '%j') {
        try {
          return JSON.stringify(value)
        } catch {
          return '[Circular]'
        }
      }
      return String(value)
    })
  },
  inspect(value: unknown): string {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  },
  inherits(constructor: { prototype: object }, superConstructor: { prototype: object }): void {
    Object.setPrototypeOf(constructor.prototype, superConstructor.prototype)
  },
  deprecate<T extends (...args: unknown[]) => unknown>(callback: T, _message: string): T {
    return callback
  },
  custom: Symbol.for('nodejs.util.inspect.custom'),
}

;(globalThis as unknown as Record<string, unknown>).require ??= (id: string): unknown => {
  if (id === 'buffer') return { Buffer }
  if (id === 'util') return utilShim
  if (id === 'events') return { EventEmitter }
  if (id === 'stream') {
    return {
      Transform,
      Readable: Transform,
      Writable: Transform,
      Duplex: Transform,
      Stream: EventEmitter,
    }
  }
  throw new Error(`require('${id}') is not available in the browser`)
}
