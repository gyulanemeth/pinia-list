export default (getConnector, onError = () => {}, settings = {}) => {
  return async function load () {
    try {
      this.status = 'loading-in-progress'
      this.items = []
      this.count = 0
      const result = await getConnector(this.params, { filter: this.filter, select: this.select, sort: this.sort, skip: this.skip, limit: this.limit })
      const retVal = JSON.parse(JSON.stringify(result))
      this.items = result.items.map(item => {
        return {
          _id: item._id,
          status: settings.metaFirst ? 'loading-in-progress' : 'ready',
          data: item,
          errors: []
        }
      })
      this.count = result.count
      this.status = 'ready'

      if (settings.metaFirst) {
        this.items.forEach(item => {
          this.getOne(item._id)
        })
      }
      return retVal
    } catch (e) {
      this.status = 'encountered-an-error'
      this.errors.push(e)
      onError(e)
      throw e
    }
  }
}
