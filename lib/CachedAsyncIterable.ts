import { isAsyncIterable, isIterable } from './helpers'

/** Class to make any async iterable, such as a generator instance, re-usable while
 * maintaining their iterable/iterator nature by caching the underlying values as
 * they are yielded.
 */
export class CachedAsyncIterable<T> implements AsyncIterable<T> {
  constructor (iterable?: Iterable<T> | AsyncIterable<T>) {
    const canIterate = isIterable<T>(iterable) || isAsyncIterable<T>(iterable)
    this._cache = []
    this._iterable = canIterate ? iterable : undefined
    this._iterableFinished = !canIterate
  }

  protected readonly _cache: T[]
  protected readonly _iterable?: Iterable<T> | AsyncIterable<T>
  protected _iterableFinished: boolean

  get [Symbol.toStringTag] (): string {
    return 'CachedAsyncIterable'
  }

  [Symbol.asyncIterator] (): AsyncIterator<T> {
    const useCache = this._iterableFinished || typeof this._iterable === 'undefined'
    const iterator: AsyncIterator<T> = useCache
      ? this._cache[Symbol.iterator]()
      : typeof this._iterable[Symbol.asyncIterator] === 'function'
        ? this._iterable[Symbol.asyncIterator]()
        : this._iterable[Symbol.iterator]()
    let index = 0

    return {
      next: async () => {
        // If the initial iteration has finished, short-circuit and just yield values from the cache.
        if (useCache) {
          return await iterator.next()
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
        const next = await iterator.next()

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
}
