import request from 'supertest'
import { jest } from '@jest/globals'
import { shutdownApp, getApp } from './utils/testApp'
import { getLoggedInCustomer, getLoggedInOwner, getNewLoggedInCustomer, getNewLoggedInOwner } from './utils/auth'
import { createRestaurant, getFirstRestaurantOfOwner } from './utils/restaurant'
import { createProduct, getProductAlreadyOrdered, getNewPaellaProductData } from './utils/product'
import dotenv from 'dotenv'
import moment from 'moment'
import { createOrder } from './utils/order.js'
dotenv.config()

describe('Get restaurant products', () => {
  let restaurant, products, app
  beforeAll(async () => {
    app = await getApp()
    const owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
  })
  it('Should return 404 if restaurant does not exist', async () => {
    const response = await request(app).get('/restaurants/incorrectId/products').send()
    expect(response.status).toBe(404)
  })
  it('Should return 200 if restaurant exists', async () => {
    const response = (await request(app).get(`/restaurants/${restaurant.id}/products`).send())
    products = response.body
    expect(response.status).toBe(200)
  })
  it('All products must have an id', async () => {
    expect(products.every(product => product.id !== undefined)).toBe(true)
  })
  it('All products must have a product category', async () => {
    expect(products.every(product => product.productCategory !== undefined)).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get product details', () => {
  let products, app
  beforeAll(async () => {
    app = await getApp()
    const owner = await getLoggedInOwner()
    products = (await request(app).get(`/restaurants/${(await getFirstRestaurantOfOwner(owner)).id}/products`).send()).body
  })
  it('Should return 404 if the product does not exist', async () => {
    const response = await request(app).get('/products/incorrectId').send()
    expect(response.status).toBe(404)
  })
  it('Should return 200 if products exists', async () => {
    const productDetailResponses = await Promise.all(products.map(async product => await request(app).get(`/products/${product.id}`).send()))
    expect(productDetailResponses.every(productDetailResponse => productDetailResponse.status === 200)).toBe(true)
    products = productDetailResponses.map(productDetailResponse => productDetailResponse.body)
  })
  it('All products must have an id', async () => {
    expect(products.every(product => product.id !== undefined)).toBe(true)
  })
  it('All products must have a product category', async () => {
    expect(products.every(product => product.productCategory !== undefined)).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Create product', () => {
  let owner, customer, productData, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    const restaurant = await getFirstRestaurantOfOwner(owner)
    customer = await getLoggedInCustomer()
    productData = await getNewPaellaProductData(restaurant)
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).post('/products').send(productData)
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).post('/products').set('Authorization', `Bearer ${customer.token}`).send(productData)
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as another owner', async () => {
    const anotherOwner = await getNewLoggedInOwner()
    const response = await request(app).post('/products').set('Authorization', `Bearer ${anotherOwner.token}`).send(productData)
    expect(response.status).toBe(403)
  })
  it('Should return 422 when invalid product data', async () => {
    const invalidProduct = { ...productData }
    invalidProduct.restaurantId = 'invalidId'
    invalidProduct.productCategoryId = 'invalidId'
    invalidProduct.availability = 'invalidAvailability'
    invalidProduct.price = -5
    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(invalidProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['restaurantId', 'availability', 'price'].every(field => errorFields.includes(field))).toBe(true)
  })
  it('Should return 200 when valid product', async () => {
    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(productData)
    expect(response.status).toBe(200)
    expect(response.body.name).toBe(productData.name)
    expect(response.body.description).toBe(productData.description)
    expect(response.body.productCategoryId).toBe(productData.productCategoryId)
    expect(response.body.restaurantId).toBe(productData.restaurantId)
    expect(response.body.price).toBe(productData.price)
    expect(response.body.order).toBe(productData.order)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Edit product', () => {
  let owner, customer, productData, newProduct, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
    const restaurant = await getFirstRestaurantOfOwner(owner)
    productData = await getNewPaellaProductData(restaurant)
    newProduct = (await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(productData)).body
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).put(`/products/${newProduct.id}`).send(newProduct)
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).put(`/products/${newProduct.id}`).set('Authorization', `Bearer ${customer.token}`).send(newProduct)
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as another owner', async () => {
    const anotherOwner = await getNewLoggedInOwner()
    const response = await request(app).put(`/products/${newProduct.id}`).set('Authorization', `Bearer ${anotherOwner.token}`).send(newProduct)
    expect(response.status).toBe(403)
  })
  it('Should return 422 when invalid restaurant', async () => {
    const invalidProduct = { ...productData }
    invalidProduct.restaurantId = 'invalidId'
    invalidProduct.productCategoryId = 'invalidId'
    invalidProduct.availability = 'invalidAvailability'
    invalidProduct.price = -5
    const response = await request(app).put(`/products/${newProduct.id}`).set('Authorization', `Bearer ${owner.token}`).send(invalidProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['restaurantId', 'availability', 'price'].every(field => errorFields.includes(field))).toBe(true)
  })
  it('Should return 422 when sending a valid product with restaurantId', async () => {
    const editedProduct = { ...newProduct }
    editedProduct.name = `${editedProduct.name} updated`
    const response = await request(app).put(`/products/${newProduct.id}`).set('Authorization', `Bearer ${owner.token}`).send(editedProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['restaurantId'].every(field => errorFields.includes(field))).toBe(true)
  })
  it('Should return 200 when sending a valid product without restaurantId', async () => {
    const { restaurantId, ...editedProduct } = newProduct
    editedProduct.name = `${editedProduct.name} updated`
    const response = await request(app).put(`/products/${newProduct.id}`).set('Authorization', `Bearer ${owner.token}`).send(editedProduct)
    expect(response.status).toBe(200)
    expect(response.body.name).toBe(`${newProduct.name} updated`)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Remove product', () => {
  let owner, anotherOwner, customer, productWithOrders, newProduct, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    anotherOwner = await getNewLoggedInOwner()
    customer = await getLoggedInCustomer()
    productWithOrders = await getProductAlreadyOrdered(owner, await getFirstRestaurantOfOwner(owner))
    newProduct = await createProduct(owner, await getFirstRestaurantOfOwner(owner))
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).delete(`/products/${productWithOrders.id}`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).delete(`/products/${productWithOrders.id}`).set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when trying to delete a product that is not yours', async () => {
    const response = await request(app).delete(`/products/${productWithOrders.id}`).set('Authorization', `Bearer ${anotherOwner.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 409 when removing a product with orders', async () => {
    const response = await request(app).delete(`/products/${productWithOrders.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(409)
  })
  it('Should return 200 when product without orders', async () => {
    const response = await request(app).delete(`/products/${newProduct.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
  })
  it('Should return 404 when trying to delete a product already deleted', async () => {
    const response = await request(app).delete(`/products/${newProduct.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(404)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})
