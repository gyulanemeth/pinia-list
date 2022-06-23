import { describe, expect, test, vi } from 'vitest'
import { setActivePinia, createPinia, defineStore } from 'pinia'

import infiniteListState from '../state/infinite.js'

import createCreateOne from './createOne.js'

describe('createOne', () => {
  describe('Errors', () => {
    test('Connector - pessimistic', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, body) => { throw new Error('mocked error') })
      const mockOnError = vi.fn()

      const useStore = defineStore('createOneTestList', {
        state: infiniteListState,
        actions: {
          createOne: createCreateOne(mockConnector, mockOnError)
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]
      store.count = 10

      const resultPromise = store.createOne({ name: 'new item' })
      expect(store.items.length).toBe(3)
      expect(store.count).toBe(10)
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, { name: 'new item' }])

      try {
        await resultPromise
      } catch (e) {
        expect(e).toEqual(new Error('mocked error'))
      }

      expect(store.items.length).toBe(3)
      expect(store.count).toBe(10)
      expect(mockOnError.mock.lastCall).toEqual([new Error('mocked error')])
      expect(store.errors).toEqual([new Error('mocked error')])
    })

    test('Connector - optimistic', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation(async (params, body) => { throw new Error('mocked error') })
      const mockOnError = vi.fn()

      const useStore = defineStore('createOneTestList', {
        state: infiniteListState,
        actions: {
          createOne: createCreateOne(mockConnector, mockOnError, { optimistic: true })
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]
      store.count = 10

      const resultPromise = store.createOne({ name: 'new item' })
      expect(store.items.length).toBe(4)
      expect(store.count).toBe(11)
      expect(store.items[0].status).toBe('creation-in-progress')
      expect(store.items[0]._id).toBe('unknown')
      expect(store.items[0].data).toEqual({ name: 'new item' })
      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, { name: 'new item' }])

      try {
        await resultPromise
      } catch (e) {
        expect(e).toEqual(new Error('mocked error'))
      }

      expect(store.items.length).toBe(3)
      expect(store.count).toBe(10)
      expect(store.items[0]._id).toBe(1)
      expect(mockOnError.mock.lastCall).toEqual([new Error('mocked error')])
      expect(store.errors).toEqual([new Error('mocked error')])
    })
  })

  describe('Success', () => {
    test('Pessimistic', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation((params, body) => ({ _id: 0, name: body.name }))

      const useStore = defineStore('createOneTestList', {
        state: infiniteListState,
        actions: {
          createOne: createCreateOne(mockConnector)
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]
      store.count = 10

      const resultPromise = store.createOne({ name: 'new item' })
      expect(store.items.length).toBe(3)
      expect(store.count).toBe(10)

      const result = await resultPromise

      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, { name: 'new item' }])
      expect(store.items.length).toBe(4)
      expect(store.count).toBe(11)
      expect(store.items[0]._id).toBe(0)
      expect(store.items[0].status).toBe('ready')
      expect(store.items[0].data).toEqual({ _id: 0, name: 'new item' })
      expect(result).toEqual({ _id: 0, name: 'new item' })
    })

    test('Optimistic', async () => {
      setActivePinia(createPinia())
      const mockConnector = vi.fn().mockImplementation((params, body) => ({ _id: 0, name: body.name }))

      const useStore = defineStore('createOneTestList', {
        state: infiniteListState,
        actions: {
          createOne: createCreateOne(mockConnector, () => {}, { optimistic: true })
        }
      })

      const store = useStore()
      store.params = { param1: 'testparam', param2: 'testparam2' }
      store.items = [
        { _id: 1, status: 'ready', data: { _id: 1, name: 'first' }, errors: [] },
        { _id: 2, status: 'ready', data: { _id: 2, name: 'second' }, errors: [] },
        { _id: 3, status: 'ready', data: { _id: 3, name: 'third' }, errors: [] }
      ]
      store.count = 10

      const resultPromise = store.createOne({ name: 'new item' })
      expect(store.items.length).toBe(4)
      expect(store.count).toBe(11)
      expect(store.items[0]._id).toBe('unknown')
      expect(store.items[0].status).toBe('creation-in-progress')
      expect(store.items[0].data).toEqual({ name: 'new item' })

      const result = await resultPromise

      expect(mockConnector.mock.lastCall).toEqual([{ param1: 'testparam', param2: 'testparam2' }, { name: 'new item' }])
      expect(store.items.length).toBe(4)
      expect(store.count).toBe(11)
      expect(store.items[0]._id).toBe(0)
      expect(store.items[0].status).toBe('ready')
      expect(store.items[0].data).toEqual({ _id: 0, name: 'new item' })
      expect(result).toEqual({ _id: 0, name: 'new item' })
    })
  })
})
