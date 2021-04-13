# indexed-iterable

A suite of iterable wrappers which implement caching and indexing of other iterables (such as generators) to make them re-usable and multi-consumable.

Provided are four classes:
  - **CachedAsyncIterable** - Implements an async wrapper around sync and async iterators with caching, allowing multiple consumers to iterate over the same data set.
  - **CachedIterable** - Implements a wrapper around sync iterators with caching, allowing multiple consumers to iterate over the same data set.
  - **CachedMap** - Extends `CachedIterable` with a complete JavaScript Map implementation.
  - **IndexedIterable** - Extends `CachedIterable` with an Array-like implementation.

Could you do a `new Map(someKeyValues)` or `Array.from(someIterable)`? Sure you could, but you would incur a performance hit since the iterable would have to be fully-consumed, blocking the event loop. With caching these class-wrappers, the iterable can be depleted as values are called-for/yielded and cached on-the-fly, allowing other asynchronous callers of the same class instance access to the values in the cache. This means the calling code is able to continue processing in-between turns of the iteration, without depleting the values or blocking other code.

# Usage

Install from npm and then:

```TypeScript
import { IndexedIterable } from 'indexed-iterable'

function * helloWorld () {
  for (let i = 0; i < 10; i++) yield { hello: 'world' }
}

const helloWorldIterable = new IndexedIterable(helloWorld())

for (const [index, value] of helloWorldIterable.entries()) {
  console.log(value)

  if (index === 3) {
    // Arbitrarily try iterating in reverse in the middle of iterating.
    for (let i = index; i > -1; i--) {
      deepStrictEqual(helloWorldIterable[i])
    }
  }

  if (index === 5) {
    // Arbitrarily try iterating fast-forward in the middle of iterating.
    for (let i = index; i < 8; i++) {
      deepStrictEqual(helloWorldIterable[i])
    }
  }
}

```

For more examples, take a look at the tests, which cover many scenarios and fully cover the code.
