import { isIterable } from './helpers'

/** Class to make any iterable, such as a generator instance, re-usable while
 * maintaining their asynchronous nature by caching the underlying values as
 * they are yielded.
 */
export class CachedIterable<T> implements Iterable<T> {
  constructor (iterable?: Iterable<T>) {
    const canIterate = isIterable<T>(iterable)
    this._cache = []
    this._iterable = canIterate ? iterable : undefined
    this._iterableFinished = !canIterate
  }

  protected readonly _cache: T[]
  protected readonly _iterable?: Iterable<T>
  protected _iterableFinished: boolean

  /** Implement iterable iterator for this class. */
  [Symbol.iterator] (): Iterator<T> {
    const useCache = this._iterableFinished || typeof this._iterable === 'undefined'
    const iterator: Iterator<T> = useCache
      ? this._cache[Symbol.iterator]()
      : this._iterable[Symbol.iterator]()
    // Preset an incremental index for setting values in the cache.
    let index = 0

    return {
      next: () => {
        // If the initial iteration has finished, short-circuit and just yield values from the cache.
        if (useCache) {
          return iterator.next()
        }

        // If the cache is populated, but another instance of iteration has not finished,
        // yield values from the cache until index is equal to or higher than the length.
        if (this._cache.length > index) {
          const cached = this._cache[index]

          index++

          return {
            done: false,
            value: cached
          }
        }

        // Iterate over the wrapped iterable, incrementing the index for each turn to correctly cache values.
        const next = iterator.next()

        // If the iterator is finished, yield that signal for the protocol.
        if (next.done) {
          this._iterableFinished = true
          index++

          return {
            done: true,
            value: next.value
          }
        }

        // Cache the value.
        this._cache[index] = next.value
        index++

        return {
          done: false,
          value: next.value
        }
      }
    }
  }

  protected getSize (): number {
    if (this._iterableFinished) {
      return this._cache.length
    }

    if (typeof this._iterable === 'object') {
      if ('size' in this._iterable) {
        return (this._iterable as any).size
      }

      if ('length' in this._iterable) {
        return (this._iterable as any).length
      }
    }

    const iterator = this[Symbol.iterator]()
    let next: IteratorResult<T> = iterator.next()
    let index = -1

    while (!next.done) {
      next = iterator.next()
      index++
    }

    return index + 1
  }
}
