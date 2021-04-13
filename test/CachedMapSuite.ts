import { deepStrictEqual, doesNotThrow, strictEqual } from 'assert'
import { CachedMap } from '../index'

interface HelloWorld {
  hello: 'world'
}

function * helloWorld (): Generator<[number, HelloWorld]> {
  for (let i = 0; i < 10; i++) {
    yield [i, { hello: 'world' }]
  }
}

const array: Array<[number, number]> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(item => [item, item])
const map = new Map(array)

describe('CachedMap', () => {
  it('should construct an instance', () => {
    const helloWorldMap = new CachedMap(helloWorld())
    const arrayIterable = new CachedMap(array)
    const mapIterable = new CachedMap(map)
    const nullIterable = new CachedMap('' as unknown as any)
    const iterable = new CachedMap()

    strictEqual(helloWorldMap instanceof CachedMap, true)
    strictEqual(arrayIterable instanceof CachedMap, true)
    strictEqual(nullIterable instanceof CachedMap, true)
    strictEqual(mapIterable instanceof CachedMap, true)
    strictEqual(iterable instanceof CachedMap, true)
    strictEqual(iterable.size, 0)
    strictEqual(mapIterable.size, 10)
    strictEqual(nullIterable.size, 0)
    strictEqual(arrayIterable.size, 10)
    strictEqual(helloWorldMap.size, 10)
  })

  it('should iterate over values', () => {
    const expected: HelloWorld = { hello: 'world' }
    const helloWorldMap = new CachedMap(helloWorld())

    for (const actual of helloWorldMap) {
      deepStrictEqual(actual[1], expected)
    }

    strictEqual(helloWorldMap.size, 10)
  })

  it('should iterate successfully regardless of which iteration', () => {
    const expected: HelloWorld = { hello: 'world' }
    const helloWorldMap = new CachedMap(helloWorld())
    let count: number

    for (const [index, actual] of helloWorldMap.entries()) {
      deepStrictEqual(actual, expected)

      if (index === 3) {
        // Arbitrarily try iterating in reverse in the middle of iterating.
        for (let i = index; i > -1; i--) {
          deepStrictEqual(helloWorldMap.get(i), expected)
        }
      }

      if (index === 5) {
        // Arbitrarily try iterating fast-forward in the middle of iterating.
        for (let i = index; i < 8; i++) {
          deepStrictEqual(helloWorldMap.get(i), expected)
        }
      }

      count = index
    }

    strictEqual(count, 9)

    for (const [index] of helloWorldMap.entries()) {
      count = index
    }

    strictEqual(count, 9)

    for (const index of helloWorldMap.keys()) {
      count = index
    }

    strictEqual(count, 9)
  })

  it ('should handle additional map methods', () => {
    const expected: HelloWorld = { hello: 'world' }
    const expected2 = { world: 'hello' }
    const map1 = new CachedMap(helloWorld())

    strictEqual(map1.has(3), true)
    strictEqual(map1.has(13), false)
    strictEqual(map1.has(8), true)

    const map2 = new CachedMap(helloWorld())

    strictEqual(map2.delete(3), true)
    strictEqual(map2.delete(13), false)
    strictEqual(map2.delete(8), true)

    const map3 = new CachedMap<string | number>(helloWorld())

    doesNotThrow(() => {
      map3.set(5, 22).set('hello', 'world').set(2, 13)
    })

    strictEqual(map3.size, 11)

    doesNotThrow(() => {
      map3.clear()
    })

    strictEqual(map3.size, 0)

    const map4 = new CachedMap<string | number>(helloWorld())

    doesNotThrow(() => {
      map4.clear()
    })

    const helloWorldMap = new CachedMap(helloWorld())

    for (const actual of helloWorldMap.values()) deepStrictEqual(actual, expected)

    helloWorldMap.forEach((actual) => deepStrictEqual(actual, expected))
    helloWorldMap.forEach((actual) => deepStrictEqual(actual, expected), expected)

    helloWorldMap['sendMe'] = expected
    helloWorldMap[4] = expected2 as any
    helloWorldMap[Symbol.iterator] = null

    deepStrictEqual(helloWorldMap['sendMe'], expected)
    deepStrictEqual(helloWorldMap[4], expected2)
    strictEqual(helloWorldMap[Symbol.iterator], null)
    strictEqual(Object.prototype.toString.call(helloWorldMap), '[object CachedMap]')
  })
})
