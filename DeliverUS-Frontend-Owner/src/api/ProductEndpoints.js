import { get, post, put, destroy } from './helpers/ApiRequestsHelper'

function getDetail (id) {
  return get(`products/${id}`)
}

function getProductCategories () {
  return get('productCategories')
}

function create (data) {
  return post('/products/', data)
}

function update (id, data) {
  return put(`products/${id}`, data)
}

function remove (id) {
  return destroy(`products/${id}`)
}

export { getDetail, getProductCategories, create, update, remove }
