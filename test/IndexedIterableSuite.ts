import { deepStrictEqual, strictEqual } from 'assert'
import { IndexedIterable } from '../index'

interface HelloWorld {
  hello: 'world'
}

function * helloWorld (): Generator<HelloWorld> {
  for (let i = 0; i < 10; i++) yield { hello: 'world' }
}

const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const map = new Map(array.map(item => [item, item]))

describe('IndexedIterable', () => {
  it('should construct an instance', () => {
    const helloWorldIterable = new IndexedIterable(helloWorld())
    const arrayIterable = new IndexedIterable(array)
    const mapIterable = new IndexedIterable(map)
    const nullIterable = new IndexedIterable('' as unknown as any)
    const iterable = new IndexedIterable()

    strictEqual(helloWorldIterable instanceof IndexedIterable, true)
    strictEqual(arrayIterable instanceof IndexedIterable, true)
    strictEqual(nullIterable instanceof IndexedIterable, true)
    strictEqual(mapIterable instanceof IndexedIterable, true)
    strictEqual(iterable instanceof IndexedIterable, true)
    strictEqual(iterable.length, 0)
    strictEqual(mapIterable.length, 10)
    strictEqual(nullIterable.length, 0)
    strictEqual(arrayIterable.length, 10)
    strictEqual(helloWorldIterable.length, 10)
  })

  it('should iterate over values', () => {
    const expected: HelloWorld = { hello: 'world' }
    const helloWorldIterable = new IndexedIterable(helloWorld())

    for (const actual of helloWorldIterable) {
      deepStrictEqual(actual, expected)
    }

    strictEqual(helloWorldIterable.length, 10)
  })

  it('should iterate successfully regardless of which iteration', () => {
    const expected: HelloWorld = { hello: 'world' }
    const helloWorldIterable = new IndexedIterable(helloWorld())
    let count: number

    for (const [index, actual] of helloWorldIterable.entries()) {
      deepStrictEqual(actual, expected)

      if (index === 3) {
        // Arbitrarily try iterating in reverse in the middle of iterating.
        for (let i = index; i > -1; i--) {
          deepStrictEqual(helloWorldIterable[i], expected)
        }
      }

      if (index === 5) {
        // Arbitrarily try iterating fast-forward in the middle of iterating.
        for (let i = index; i < 8; i++) {
          deepStrictEqual(helloWorldIterable[i], expected)
        }
      }

      count = index
    }

    strictEqual(count, 9)

    for (const [index] of helloWorldIterable.entries()) {
      count = index
    }

    strictEqual(count, 9)

    for (const index of helloWorldIterable.keys()) {
      count = index
    }

    strictEqual(count, 9)
  })

  it ('should handle additional array-like methods', () => {
    const expected: HelloWorld = { hello: 'world' }
    const expected2 = { world: 'hello' }
    const helloWorldIterable = new IndexedIterable(helloWorld())

    for (const actual of helloWorldIterable.values()) deepStrictEqual(actual, expected)

    helloWorldIterable.forEach((actual) => deepStrictEqual(actual, expected))
    helloWorldIterable.forEach((actual) => deepStrictEqual(actual, expected), expected)

    const newIterable = helloWorldIterable.map(hw => {
      return { [hw.hello]: 'hello' }
    })

    for (const actual of newIterable) deepStrictEqual(actual, expected2)

    const new2Iterable = helloWorldIterable.map(hw => {
      return { [hw.hello]: 'hello' }
    }, newIterable)

    for (const actual of new2Iterable) deepStrictEqual(actual, expected2)

    helloWorldIterable['sendMe'] = expected
    helloWorldIterable[4] = expected2 as any
    helloWorldIterable[Symbol.iterator] = null

    deepStrictEqual(helloWorldIterable['sendMe'], expected)
    deepStrictEqual(helloWorldIterable[4], expected2)
    strictEqual(helloWorldIterable[Symbol.iterator], null)
  })
})
