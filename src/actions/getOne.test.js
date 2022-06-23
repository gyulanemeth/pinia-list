import { describe, expect, test, vi } from 'vitest'
import { setActivePinia, createPinia, defineStore } from 'pinia'

import infiniteListState from '../state/infinite.js'

import createGetOne from './getOne.js'

describe('getOne', () => {
  describe('Errors', () => {
    test('Not found in the store', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation((params, body) => JSON.parse(JSON.stringify((body))))
      const mockOnError = vi.fn()

      const useStore = defineStore('getOneTestList', {
        state: infiniteListState,
        actions: {
          getOne: createGetOne(mockConnector, mockOnError)
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]

      expect(store.getOne(4)).rejects.toThrow(new Error('Item with _id: 4 was not found in the store.'))
      expect(mockOnError.mock.lastCall).toEqual([new Error('Item with _id: 4 was not found in the store.')])
      expect(store.status).toBe('encountered-an-error')
      expect(store.errors).toEqual([new Error('Item with _id: 4 was not found in the store.')])
    })

    test('Connector', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, body) => { throw new Error('mocked error') })
      const mockOnError = vi.fn()

      const useStore = defineStore('getOneTestList', {
        state: infiniteListState,
        actions: {
          getOne: createGetOne(mockConnector, mockOnError)
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]

      const resultPromise = store.getOne(2)
      expect(store.items[1].status).toBe('loading-in-progress')
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2', id: 2 }])

      try {
        await resultPromise
      } catch (e) {
        expect(e).toEqual(new Error('mocked error'))
      }

      expect(store.items[1].data.name).toBe('second')
      expect(store.items[1].status).toBe('encountered-an-error')
      expect(mockOnError.mock.lastCall).toEqual([new Error('mocked error')])
      expect(store.items[1].errors).toEqual([new Error('mocked error')])
    })
  })

  test('Success', async () => {
    setActivePinia(createPinia())
    const mockConnector = vi.fn().mockImplementation((params) => JSON.parse(JSON.stringify(({ _id: 2, name: 'loaded', description: 'loaded' }))))

    const useStore = defineStore('getOneTestList', {
      state: infiniteListState,
      actions: {
        getOne: createGetOne(mockConnector)
      }
    })

    const store = useStore()
    store.params = { param1: 'testparam', param2: 'testparam2' }
    store.items = [
      { _id: 1, status: 'ready', data: { _id: 1, name: 'first', description: 'desc1' }, errors: [] },
      { _id: 2, status: 'ready', data: { _id: 2, name: 'second', description: 'desc2' }, errors: [] },
      { _id: 3, status: 'ready', data: { _id: 3, name: 'third', description: 'desc3' }, errors: [] }
    ]

    const resultPromise = store.getOne(2, { name: 'updated' })
    expect(store.items[1].status).toBe('loading-in-progress')
    expect(store.items[1].data.name).toBe('second')

    const result = await resultPromise

    expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2', id: 2 }])
    expect(store.items[1].status).toBe('ready')
    expect(store.items[1].data.name).toBe('loaded')
    expect(store.items[1].data.description).toBe('loaded')
    expect(result).toEqual({ _id: 2, name: 'loaded', description: 'loaded' })
  })
})
