import { describe, expect, test, vi } from 'vitest'
import { setActivePinia, createPinia, defineStore } from 'pinia'

import pagedState from '../state/paged.js'

import createLoadPage from './loadPage.js'

describe('loadPage', () => {
  describe('Errors', () => {
    test('Connector', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, query) => { throw new Error('mocked error') })
      const mockOnError = vi.fn()

      const useStore = defineStore('loadPageTestList', {
        state: pagedState,
        actions: {
          loadPage: createLoadPage(mockConnector, mockOnError)
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.filter = { name: 'testname' }
      store.select = { name: 1 }
      store.sort = { name: -1 }
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] },
        { _id: 4, status: 'ready', data: { _id: 3, name: 'fourth' }, errors: [] }

      ]
      store.count = 4
      store.itemsPerPage = 2

      const resultPromise = store.loadPage(1)
      expect(store.status).toBe('loading-in-progress')
      expect(store.items.length).toBe(0)
      expect(store.count).toBe(4)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 0,
        limit: 2
      }])

      try {
        await resultPromise
      } catch (e) {
        expect(e).toEqual(new Error('mocked error'))
      }

      expect(store.status).toBe('encountered-an-error')
      expect(store.items.length).toBe(0)
      expect(store.count).toBe(4)

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
          count: 2
        }
      })
      const mockOnError = vi.fn()

      const useStore = defineStore('loadTestList', {
        state: pagedState,
        actions: {
          loadPage: createLoadPage(mockConnector, mockOnError)
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.filter = { name: 'testname' }
      store.select = { name: 1 }
      store.sort = { name: -1 }
      store.itemsPerPage = 2
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] },
        { _id: 4, status: 'ready', data: { _id: 3, name: 'fourth' }, errors: [] }
      ]
      store.count = 4

      const resultPromise = store.loadPage(1)
      expect(store.status).toBe('loading-in-progress')
      expect(store.items.length).toBe(0)
      expect(store.count).toBe(4)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 0,
        limit: 2
      }])

      const result = await resultPromise

      expect(result).toEqual({
        items: [
          { _id: 1, name: 'test1' },
          { _id: 2, name: 'test2' }
        ],
        count: 2
      })
      expect(store.status).toBe('ready')
      expect(store.items.length).toBe(2)
      expect(store.count).toBe(2)
      expect(store.pageNum).toBe(1)
      expect(store.numOfPages).toBe(1)
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
          count: 2
        }
      })
      const mockOnError = vi.fn()
      const mockGetOne = vi.fn()

      const useStore = defineStore('loadTestList', {
        state: pagedState,
        actions: {
          loadPage: createLoadPage(mockConnector, mockOnError, { metaFirst: true }),
          getOne: mockGetOne
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.filter = { name: 'testname' }
      store.select = { name: 1 }
      store.sort = { name: -1 }
      store.itemsPerPage = 2
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] },
        { _id: 4, status: 'ready', data: { _id: 3, name: 'fourth' }, errors: [] }
      ]
      store.count = 4

      const resultPromise = store.loadPage(2)
      expect(store.status).toBe('loading-in-progress')
      expect(store.items.length).toBe(0)
      expect(store.count).toBe(4)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, {
        filter: { name: 'testname' },
        select: { name: 1 },
        sort: { name: -1 },
        skip: 2,
        limit: 2
      }])

      const result = await resultPromise

      expect(result).toEqual({
        items: [
          { _id: 1, name: 'test1' },
          { _id: 2, name: 'test2' }
        ],
        count: 2
      })
      expect(store.status).toBe('ready')
      expect(store.items.length).toBe(2)
      expect(store.count).toBe(2)
      expect(store.pageNum).toBe(2)
      expect(store.numOfPages).toBe(1)
      expect(store.items[0]._id).toBe(1)
      expect(store.items[0].status).toBe('loading-in-progress')
      expect(store.items[0].data.name).toBe('test1')
      expect(store.items[1]._id).toBe(2)
      expect(store.items[1].status).toBe('loading-in-progress')
      expect(store.items[1].data.name).toBe('test2')

      expect(mockGetOne.mock.calls).toEqual([[1], [2]])
    })
  })

  test('Load Next Page', async () => {
    setActivePinia(createPinia())
    const mockConnector = vi.fn().mockImplementation(async (params, query) => {
      const items = [{ _id: 1, name: 'test1' }, { _id: 2, name: 'test2' }].slice(query.skip, query.skip + query.limit)
      return {
        items,
        count: 2
      }
    })
    const mockOnError = vi.fn()

    const useStore = defineStore('loadTestList', {
      state: pagedState,
      actions: {
        loadPage: createLoadPage(mockConnector, mockOnError)
      }
    })

    const store = useStore()
    store.params = { param1: 'testparam', param2: 'testparam2' }
    store.filter = { name: 'testname' }
    store.select = { name: 1 }
    store.sort = { name: -1 }
    store.itemsPerPage = 1
    store.items = []
    store.count = 2

    const resultPromise = store.loadPage(1)

    const result = await resultPromise

    expect(result).toEqual({
      items: [
        { _id: 1, name: 'test1' }
      ],
      count: 2
    })
    expect(store.status).toBe('ready')
    expect(store.items.length).toBe(1)
    expect(store.count).toBe(2)
    expect(store.pageNum).toBe(1)
    expect(store.numOfPages).toBe(2)
    expect(store.items[0]._id).toBe(1)
    expect(store.items[0].status).toBe('ready')
    expect(store.items[0].data.name).toBe('test1')

    const resultPromiseNext = store.loadPage(2)

    const resultNext = await resultPromiseNext

    expect(resultNext).toEqual({
      items: [
        { _id: 2, name: 'test2' }
      ],
      count: 2
    })

    expect(store.items[0]._id).toBe(2)
    expect(store.items[0].status).toBe('ready')
    expect(store.items[0].data.name).toBe('test2')
  })
})
