/** Class to make any iterable, such as a generator instance, re-usable while
 * maintaining their asynchronous nature by caching the underlying values as
 * they are yielded.
 */
export class CachedIterable<T> implements Iterable<T> {
  constructor (iterable?: Iterable<T>) {
    this._cache = []
    this._iterable = iterable
    this._iterableFinished = typeof iterable === 'undefined'
  }

  protected readonly _cache: T[]
  protected readonly _iterable?: Iterable<T>
  protected _iterableFinished: boolean

  /** Implement iterable iterator for this class. */
  * [Symbol.iterator] (): IterableIterator<T> {
    // If the initial iteration has finished, short-circuit and yield values from the cache.
    if (this._iterableFinished) {
      for (const value of this._cache) yield value

      return
    }

    // Preset an incremental index for setting values in the cache.
    let index = 0

    if (this._cache.length > 0) {
      // If the cache is populated, but another instance of iteration has not finished, yield values from the cache first.
      for (const value of this._cache) {
        yield value

        // Increment the index for each turn so that the current state of the iterable populates values in their correct cache index.
        index++
      }
    }

    // Iterate over the wrapped iterable, incrementing the index for each turn to correctly cache values.
    for (const value of this._iterable) {
      this._cache[index] = value

      yield value

      index++

      // If the cache "suddenly" has an index equal to or greater than the current iterable index,
      // then another call has been made to iterate that is further along than this call; yield from the cache.
      if (this._cache.length >= index) {
        for (let newIndex = index; newIndex < this._cache.length; newIndex++) {
          yield this._cache[newIndex]
        }
      }
    }

    // When the current iterable has been iterated once, set the flag to short-circuit from the cache for subsequent calls.
    this._iterableFinished = true
  }
}
