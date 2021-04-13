import { deepStrictEqual, strictEqual } from 'assert'
import { CachedAsyncIterable, CachedIterable } from '../index'

interface HelloWorld {
  hello: 'world'
}

async function * helloWorld (): AsyncGenerator<HelloWorld> {
  for (let i = 0; i < 10; i++) yield { hello: 'world' }
}

const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

describe('Base Classes', () => {
  describe('CachedIterable', () => {
    it('should pass a toStringTag', () => {
      const cachedIterable = new CachedIterable(array)

      strictEqual(Object.prototype.toString.call(cachedIterable), '[object CachedIterable]')
    })
  })

  describe('CachedAsyncIterable', () => {
    it('should construct an instance', () => {
      const helloWorldIterable = new CachedAsyncIterable(helloWorld())
      const arrayIterable = new CachedAsyncIterable(array)
      const nullIterable = new CachedAsyncIterable('' as unknown as any)
      const iterable = new CachedAsyncIterable()
  
      strictEqual(helloWorldIterable instanceof CachedAsyncIterable, true)
      strictEqual(arrayIterable instanceof CachedAsyncIterable, true)
      strictEqual(nullIterable instanceof CachedAsyncIterable, true)
      strictEqual(iterable instanceof CachedAsyncIterable, true)
    })

    it('should iterate over values', async () => {
      const expected: HelloWorld = { hello: 'world' }
      const helloWorldIterable = new CachedAsyncIterable(helloWorld())
      const arrayIterable = new CachedAsyncIterable(array)
      let length = 0
      let nested = 0

      for await (const actual of helloWorldIterable) {
        deepStrictEqual(actual, expected)

        if (length === 3) {
          for await (const actual of helloWorldIterable) {
            deepStrictEqual(actual, expected)

            if (nested === 6) break
          }
        }
        length++
      }

      strictEqual(length, 10)

      length = 0

      for await (const actual of helloWorldIterable) {
        deepStrictEqual(actual, expected)
        length++
      }

      strictEqual(length, 10)

      for await (const actual of arrayIterable) strictEqual(typeof actual, 'number')
    })

    it('should pass a toStringTag', () => {
      const cachedIterable = new CachedAsyncIterable(array)

      strictEqual(Object.prototype.toString.call(cachedIterable), '[object CachedAsyncIterable]')
    })
  })
})
