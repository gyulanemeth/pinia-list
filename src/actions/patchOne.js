export default (patchConnector, onError = () => {}, settings = {}) => {
  return async function patchOne (id, body) {
    let item
    let previousState
    try {
      item = this.items.find(item => item._id === id)
      if (!item) {
        throw new Error(`Item with _id: ${id} was not found in the store.`)
      }
      if (settings.optimistic) {
        previousState = JSON.parse(JSON.stringify(item.data))
        item.data = { ...item.data, ...body }
      } else {
        item.status = 'patch-in-progress'
      }
      const result = await patchConnector({ ...this.params, id }, body)
      if (!settings.optimistic) {
        item.data = { ...item.data, ...result }
        item.status = 'ready'
      }
      return result
    } catch (e) {
      if (item) {
        item.status = 'encountered-an-error'
        item.errors.push(e)

        if (settings.optimistic) {
          item.data = previousState
        }
      } else {
        this.status = 'encountered-an-error'
        this.errors.push(e)
      }

      onError(e)
      throw e
    }
  }
}
