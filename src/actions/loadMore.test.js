import { describe, expect, test, vi } from 'vitest'
import { setActivePinia, createPinia, defineStore } from 'pinia'

import infiniteListState from '../state/infinite.js'

import createLoadMore from './loadMore.js'

describe('loadMore', () => {
  describe('Errors', () => {
    test('Connector', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, query) => { throw new Error('mocked error') })
      const mockOnError = vi.fn()

      const useStore = defineStore('loadMoreTestList', {
        state: infiniteListState,
        actions: {
          loadMore: createLoadMore(mockConnector, mockOnError)
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

      const resultPromise = store.loadMore()
      expect(store.status).toBe('loading-more-in-progress')
      expect(store.items.length).toBe(3)
      expect(store.count).toBe(10)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 3,
        limit: 30
      }])

      try {
        await resultPromise
      } catch (e) {
        expect(e).toEqual(new Error('mocked error'))
      }

      expect(store.status).toBe('encountered-an-error')
      expect(store.items.length).toBe(3)
      expect(store.count).toBe(10)

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
            { _id: 4, name: 'test1' },
            { _id: 5, name: 'test2' }
          ],
          count: 20
        }
      })
      const mockOnError = vi.fn()

      const useStore = defineStore('loadMoreTestList', {
        state: infiniteListState,
        actions: {
          loadMore: createLoadMore(mockConnector, mockOnError)
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

      const resultPromise = store.loadMore()
      expect(store.status).toBe('loading-more-in-progress')
      expect(store.items.length).toBe(3)
      expect(store.count).toBe(10)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 3,
        limit: 30
      }])

      const result = await resultPromise

      expect(result).toEqual({
        items: [
          { _id: 4, name: 'test1' },
          { _id: 5, name: 'test2' }
        ],
        count: 20
      })
      expect(store.status).toBe('ready')
      expect(store.items.length).toBe(5)
      expect(store.count).toBe(20)
      expect(store.items[0]._id).toBe(1)
      expect(store.items[0].status).toBe('ready')
      expect(store.items[0].data.name).toBe('first')
      expect(store.items[1]._id).toBe(2)
      expect(store.items[1].status).toBe('ready')
      expect(store.items[1].data.name).toBe('second')
      expect(store.items[2]._id).toBe(3)
      expect(store.items[2].status).toBe('ready')
      expect(store.items[2].data.name).toBe('third')
      expect(store.items[3]._id).toBe(4)
      expect(store.items[3].status).toBe('ready')
      expect(store.items[3].data.name).toBe('test1')
      expect(store.items[4]._id).toBe(5)
      expect(store.items[4].status).toBe('ready')
      expect(store.items[4].data.name).toBe('test2')
    })

    test('Meta first', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, query) => {
        return {
          items: [
            { _id: 4, name: 'test1' },
            { _id: 5, name: 'test2' }
          ],
          count: 20
        }
      })
      const mockOnError = vi.fn()
      const mockGetOne = vi.fn()

      const useStore = defineStore('loadMoreTestList', {
        state: infiniteListState,
        actions: {
          loadMore: createLoadMore(mockConnector, mockOnError, { metaFirst: true }),
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

      const resultPromise = store.loadMore()
      expect(store.status).toBe('loading-more-in-progress')
      expect(store.items.length).toBe(3)
      expect(store.count).toBe(10)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 3,
        limit: 30
      }])

      const result = await resultPromise

      expect(result).toEqual({
        items: [
          { _id: 4, name: 'test1' },
          { _id: 5, name: 'test2' }
        ],
        count: 20
      })
      expect(store.status).toBe('ready')
      expect(store.items.length).toBe(5)
      expect(store.count).toBe(20)
      expect(store.items[0]._id).toBe(1)
      expect(store.items[0].status).toBe('ready')
      expect(store.items[0].data.name).toBe('first')
      expect(store.items[1]._id).toBe(2)
      expect(store.items[1].status).toBe('ready')
      expect(store.items[1].data.name).toBe('second')
      expect(store.items[2]._id).toBe(3)
      expect(store.items[2].status).toBe('ready')
      expect(store.items[2].data.name).toBe('third')
      expect(store.items[3]._id).toBe(4)
      expect(store.items[3].status).toBe('loading-in-progress')
      expect(store.items[3].data.name).toBe('test1')
      expect(store.items[4]._id).toBe(5)
      expect(store.items[4].status).toBe('loading-in-progress')
      expect(store.items[4].data.name).toBe('test2')

      expect(mockGetOne.mock.calls).toEqual([[4], [5]])
    })
  })
})
