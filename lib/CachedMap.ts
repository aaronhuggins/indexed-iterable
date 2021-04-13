import { CachedIterable } from './CachedIterable'

/** An extension of cached iterable which implements the JavaScript Map interface. */
export class CachedMap<K = any, V = any> extends CachedIterable<[K, V]> implements Map<K, V> {
  constructor (entries?: Iterable<[K, V]>) {
    super(entries)

    this._keys = []
    this._values = []
  }

  protected _keys: K[]
  protected _values: V[]

  get size (): number {
    return super.getSize()
  }

  get [Symbol.toStringTag] (): string {
    return 'CachedMap'
  }

  * [Symbol.iterator] (): IterableIterator<[K, V]> {
    const iterator = super[Symbol.iterator]()
    let next: IteratorResult<[K, V]> = iterator.next()
    let index = 0

    while (!next.done) {
      this._keys[index] = next.value[0]
      this._values[index] = next.value[1]

      yield next.value

      next = iterator.next()
      index++
    }

    this._iterableFinished = true
  }

  clear (): void {
    if (!this._iterableFinished) {
      const iterator = this[Symbol.iterator]()

      while (!this._iterableFinished) {
        iterator.next()
      }
    }

    this._keys.splice(0, this._keys.length)
    this._values.splice(0, this._values.length)
    this._cache.splice(0, this._cache.length)
  }

  delete (key: K): boolean {
    const index = this._keys.indexOf(key)

    if (index > -1) {
      this._keys.splice(index, 1)
      this._values.splice(index, 1)

      return true
    } else {
      for (const [findKey] of this) {
        if (findKey === key) {
          this._keys.splice(index, 1)
          this._values.splice(index, 1)

          return true
        }
      }
    }

    return false
  }

  forEach(callbackfn: (value: V, key: K, map: CachedMap<K, V>) => void, thisArg?: any): void {
    const fn: typeof callbackfn = typeof thisArg === 'undefined'
      ? callbackfn.bind(this)
      : callbackfn.bind(thisArg)

    for (const [key, value] of this.entries()) fn(value, key, this)
  }

  get(key: K): V | undefined {
    const index = this._keys.indexOf(key)

    if (index > -1) {
      return this._values[index]
    } else {
      for (const [findKey, value] of this) {
        if (findKey === key) return value
      }
    }
  }

  has(key: K): boolean {
    const index = this._keys.indexOf(key)

    if (index > -1) {
      return true
    } else {
      for (const [findKey] of this) {
        if (findKey === key) return true
      }
    }

    return false
  }

  set(key: K, value: V): this {
    const index = this._keys.indexOf(key)

    if (index > -1) {
      this._values[index] = value
    } else {
      this._keys.push(key)
      this._values.push(value)
    }

    return this
  }

  /** Returns an iterable of key, value pairs for every entry in the map. */
  * entries(): IterableIterator<[K, V]> {
    for (const kv of this) yield kv
  }

  /** Returns an iterable of keys in the map. */
  * keys(): IterableIterator<K> {
    for (const [key] of this) yield key
  }

  /** Returns an iterable of values in the map. */
  * values(): IterableIterator<V> {
    for (const kv of this) yield kv[1]
  }
}
