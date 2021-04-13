/** Test if an object is an iterable. */
export function isIterable<T = any> (iterable: any): iterable is Iterable<T> {
  return typeof iterable !== 'undefined' && iterable !== null && typeof iterable[Symbol.iterator] === 'function'
}

/** Test if an object is an async iterable. */
export function isAsyncIterable<T = any> (iterable: any): iterable is AsyncIterable<T> {
  return typeof iterable !== 'undefined' && iterable !== null && typeof iterable[Symbol.asyncIterator] === 'function'
}
