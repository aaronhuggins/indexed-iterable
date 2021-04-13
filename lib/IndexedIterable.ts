import { CachedIterable } from './CachedIterable'

/** An extension of cached iterable which adds array-like indices, and map and forEach functions. */
export class IndexedIterable<T> extends CachedIterable<T> {
  constructor (iterable?: Iterable<T>) {
    super(iterable)

    return new Proxy(this, {
      get (target: IndexedIterable<T>, prop: string | symbol, receiver: any): any {
        if (typeof prop === 'string') {
          const key = parseFloat(prop)

          if (Number.isNaN(key)) {
            return target[prop]
          } else {
            return target.getByIndex(key)
          }
        } else {
          return target[prop]
        }
      },
      set (target: IndexedIterable<T>, prop: string | symbol, value: any, receiver: any): boolean {
        if (typeof prop === 'string') {
          const key = parseFloat(prop)

          if (Number.isNaN(key)) {
            target[prop] = value
          } else {
            target._cache[key] = value
          }
        } else {
          target[prop] = value
        }

        return true
      }
    })
  }

  [key: number]: T

  /** Gets the length of the indexed iterable. This is a number one higher than the highest index.
   * > NOTE: May inroduce a performance hit in the absence of a 'size' or 'length' property on the
   * > wrapped iterable, as it must pre-cache the iterable in order to determine its length.
   */
  get length (): number {
    return super.getSize()
  }

  get [Symbol.toStringTag] (): string {
    return 'IndexedIterable'
  }

  /** Get a result by its index in the list. */
  private getByIndex (key: number): T {
    // We check if `key in ...` because we need to avoid weird cases where `indexOf` or `includes` may return `-1` despite an index being present.
    if (key in this._cache || this._iterableFinished) {
      return this._cache[key]
    }

    let result: T

    for (const [index, value] of this.entries()) {
      if (index === key) {
        result = value
        break
      }
    }

    return result
  }

  /** Returns an iterable of key, value pairs for every entry in the indexed iterable. */
  * entries (): IterableIterator<[number, T]> {
    let index = 0

    for (const value of this) {
      yield [index, value]

      index++
    }
  }

  /** Returns an iterable of keys for every entry in the indexed iterable. */
  * keys (): IterableIterator<number> {
    for (const [index] of this.entries()) yield index
  }

  /** Returns an iterable of values for every entry in the indexed iterable. */
  * values (): IterableIterator<T> {
    for (const value of this) yield value
  }

  /** Execute a synchronous callback for each value in the indexed iterable. */
  forEach (callbackfn: (value: T, key: number, parent: IndexedIterable<T>) => void, thisArg?: any): void {
    const fn: typeof callbackfn = typeof thisArg === 'undefined'
      ? callbackfn.bind(this)
      : callbackfn.bind(thisArg)

    for (const [key, value] of this.entries()) fn(value, key, this)
  }

  /** Map each value to the result of a synchronous callback. */
  map<U> (callbackfn: (value: T, index: number, parent: IndexedIterable<T>) => U, thisArg?: any): IndexedIterable<U> {
    const entries = this.entries()
    const fn: typeof callbackfn = typeof thisArg === 'undefined'
      ? callbackfn.bind(this)
      : callbackfn.bind(thisArg)
    const mapper = function * map (list: IndexedIterable<T>): IterableIterator<U> {
      for (const [key, value] of entries) {
        yield fn(value, key, list)
      }
    }

    return new IndexedIterable(mapper(this))
  }
}
