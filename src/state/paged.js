export default () => {
  return {
    isLoading: false,

    params: {},
    filter: {},
    select: {},
    sort: {},

    pageNum: 1,
    itemsPerPage: 10,
    numOfPages: 0,

    items: [],
    count: 0,

    errors: []
  }
}
