import { describe, expect, test, vi } from 'vitest'
import { setActivePinia, createPinia, defineStore } from 'pinia'

import infiniteListState from '../state/infinite.js'

import createLoad from './load.js'
// import createGetOne from './getOne.js'

describe('load', () => {
  describe('Errors', () => {
    test('Connector', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, query) => { throw new Error('mocked error') })
      const mockOnError = vi.fn()

      const useStore = defineStore('loadTestList', {
        state: infiniteListState,
        actions: {
          load: createLoad(mockConnector, mockOnError)
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.filter = { name: 'testname' }
      store.select = { name: 1 }
      store.sort = { name: -1 }
      store.skip = 20
      store.limit = 30
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]
      store.count = 10

      const resultPromise = store.load()
      expect(store.status).toBe('loading-in-progress')
      expect(store.items.length).toBe(0)
      expect(store.count).toBe(0)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 20,
        limit: 30
      }])

      try {
        await resultPromise
      } catch (e) {
        expect(e).toEqual(new Error('mocked error'))
      }

      expect(store.status).toBe('encountered-an-error')
      expect(store.items.length).toBe(0)
      expect(store.count).toBe(0)

      expect(mockOnError.mock.lastCall).toEqual([new Error('mocked error')])
      expect(store.errors).toEqual([new Error('mocked error')])
    })
  })

  describe('Success', () => {
    test('Full items', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, query) => {
        return {
          items: [
            { _id: 1, name: 'test1' },
            { _id: 2, name: 'test2' }
          ],
          count: 10
        }
      })
      const mockOnError = vi.fn()

      const useStore = defineStore('loadTestList', {
        state: infiniteListState,
        actions: {
          load: createLoad(mockConnector, mockOnError)
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.filter = { name: 'testname' }
      store.select = { name: 1 }
      store.sort = { name: -1 }
      store.skip = 20
      store.limit = 30
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]
      store.count = 10

      const resultPromise = store.load()
      expect(store.status).toBe('loading-in-progress')
      expect(store.items.length).toBe(0)
      expect(store.count).toBe(0)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 20,
        limit: 30
      }])

      const result = await resultPromise

      expect(result).toEqual({
        items: [
          { _id: 1, name: 'test1' },
          { _id: 2, name: 'test2' }
        ],
        count: 10
      })
      expect(store.status).toBe('ready')
      expect(store.items.length).toBe(2)
      expect(store.count).toBe(10)
      expect(store.items[0]._id).toBe(1)
      expect(store.items[0].status).toBe('ready')
      expect(store.items[0].data.name).toBe('test1')
      expect(store.items[1]._id).toBe(2)
      expect(store.items[1].status).toBe('ready')
      expect(store.items[1].data.name).toBe('test2')
    })

    test('Meta first', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, query) => {
        return {
          items: [
            { _id: 1, name: 'test1' },
            { _id: 2, name: 'test2' }
          ],
          count: 10
        }
      })
      const mockOnError = vi.fn()
      const mockGetOne = vi.fn()

      const useStore = defineStore('loadTestList', {
        state: infiniteListState,
        actions: {
          load: createLoad(mockConnector, mockOnError, { metaFirst: true }),
          getOne: mockGetOne
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.filter = { name: 'testname' }
      store.select = { name: 1 }
      store.sort = { name: -1 }
      store.skip = 20
      store.limit = 30
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]
      store.count = 10

      const resultPromise = store.load()
      expect(store.status).toBe('loading-in-progress')
      expect(store.items.length).toBe(0)
      expect(store.count).toBe(0)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 20,
        limit: 30
      }])

      const result = await resultPromise

      expect(result).toEqual({
        items: [
          { _id: 1, name: 'test1' },
          { _id: 2, name: 'test2' }
        ],
        count: 10
      })
      expect(store.status).toBe('ready')
      expect(store.items.length).toBe(2)
      expect(store.count).toBe(10)
      expect(store.items[0]._id).toBe(1)
      expect(store.items[0].status).toBe('loading-in-progress')
      expect(store.items[0].data.name).toBe('test1')
      expect(store.items[1]._id).toBe(2)
      expect(store.items[1].status).toBe('loading-in-progress')
      expect(store.items[1].data.name).toBe('test2')

      expect(mockGetOne.mock.calls).toEqual([[1], [2]])
    })
  })
})
