export default (getConnector, onError = () => {}, settings = {}) => {
  return async function loadPage (pageNum) {
    try {
      this.status = 'loading-in-progress'
      this.items = []
      const pageNumber = pageNum <= 1 ? 1 : pageNum
      const result = await getConnector(this.params, { filter: this.filter, select: this.select, sort: this.sort, skip: this.itemsPerPage * (pageNumber - 1), limit: this.itemsPerPage })
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
      this.pageNum = pageNumber
      this.numOfPages = Math.ceil(this.count / this.itemsPerPage)

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
