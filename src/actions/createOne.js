export default (postConnector, onError = () => {}) => {
  return async function createOne (body) {
    let newItem
    try {
      newItem = { _id: 'unknown', status: 'creation-in-progress', data: body }
      this.items.unshift(newItem)
      if (!body) {
        console.log('never happens')
      }
      const newItemData = await postConnector(body)
      newItem._id = newItemData._id
      newItem.data = newItemData
      newItem.status = 'ready'
    } catch (e) {
      this.status = 'encountered-an-error'
      this.errors.push(e)
      this.items.splice(this.items.indexOf(newItem), 1)
      onError(e)
      throw e
    }
  }
}
