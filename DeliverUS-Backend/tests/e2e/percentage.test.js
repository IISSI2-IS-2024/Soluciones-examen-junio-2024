import { getApp, shutdownApp } from './utils/testApp'
import { bodeguitaRestaurant, cervezaProduct, paellaProduct } from './utils/testData'
import { getLoggedInCustomer, getLoggedInOwner } from './utils/auth'
import { createRestaurant, getFirstRestaurantOfOwner } from './utils/restaurant'

import request from 'supertest'
import { createProduct, getNewCervezaProductData, getNewPaellaProductData } from './utils/product'

describe('Create product and edit products', () => {
  let owner, customer, productData, app, newProduct
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    const restaurant = await getFirstRestaurantOfOwner(owner)
    customer = await getLoggedInCustomer()
    productData = await getNewPaellaProductData(restaurant)
    newProduct = (await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(productData)).body
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).post('/products').send(productData)
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).post('/products').set('Authorization', `Bearer ${customer.token}`).send(productData)
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
  it('Check product base price', async () => {
    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(productData)
    expect(response.status).toBe(200)
    expect(response.body.name).toBe(productData.name)
    expect(response.body.basePrice).toBe(productData.price)
    expect(response.body.description).toBe(productData.description)
    expect(response.body.productCategoryId).toBe(productData.productCategoryId)
    expect(response.body.restaurantId).toBe(productData.restaurantId)
    expect(response.body.price).toBe(productData.price)
    expect(response.body.order).toBe(productData.order)
  })
  it('Should return 200 when sending a valid product and checking price', async () => {
    const { restaurantId, ...editedProduct } = newProduct
    editedProduct.name = `${editedProduct.name} updated`
    editedProduct.price = 1.0
    const response = await request(app).put(`/products/${newProduct.id}`).set('Authorization', `Bearer ${owner.token}`).send(editedProduct)
    expect(response.status).toBe(200)
    expect(response.body.name).toBe(`${newProduct.name} updated`)
    expect(response.body.price).toBe(1.0)
    expect(response.body.basePrice).toBe(1.0)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Set a percentage to restaurant products', () => {
  let owner, customer, newRestaurant, app, newRestaurant2, productData1, productData2, productData3
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()

    newRestaurant = await createRestaurant(owner)
    newRestaurant2 = await createRestaurant(owner)
    let paella = await getNewPaellaProductData(newRestaurant)
    let cerveza = await getNewCervezaProductData(newRestaurant)
    let paella2 = await getNewPaellaProductData(newRestaurant2)
    productData1 = (await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(paella)).body
    productData2 = (await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(cerveza)).body
    productData3 = (await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(paella2)).body
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).put(`/restaurants/${newRestaurant.id}`).send(newRestaurant)
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).put(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${customer.token}`).send(newRestaurant)
    expect(response.status).toBe(403)
  })
  it('Should return 403 when trying to set a restaurant percentage that is not yours', async () => {
    const restaurantNotOwned = await createRestaurant()
    const response = await request(app).put(`/restaurants/${restaurantNotOwned.id}`).set('Authorization', `Bearer ${owner.token}`).send(restaurantNotOwned)
    expect(response.status).toBe(403)
  })
  it('Should return 200 when successfully set a restaurant percentage', async () => {
    let newRestaurantCopy = newRestaurant
    newRestaurantCopy.percentage = 1
    newRestaurantCopy.userId = undefined
    const response = await request(app).put(`/restaurants/${newRestaurantCopy.id}`).set('Authorization', `Bearer ${owner.token}`).send(newRestaurantCopy)
    expect(response.body.percentage).toBeDefined()
    expect(response.body.percentage).toBe(1)
    expect(response.status).toBe(200)
  })
  it('Should return 200 and the restaurant has to be set with percentage', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.percentage).toBeDefined()
    expect(response.body.percentage).toBe(1)
    expect(response.status).toBe(200)
  })
  it('Should return 200 when successfully set a restaurant percentage', async () => {
    let newRestaurantCopy = newRestaurant
    newRestaurantCopy.percentage = -1
    const response = await request(app).put(`/restaurants/${newRestaurantCopy.id}`).set('Authorization', `Bearer ${owner.token}`).send(newRestaurantCopy)
    expect(response.body.percentage).toBe(-1)
    expect(response.status).toBe(200)
  })
  it('Should return 200 and the restaurant has to be set with percentage', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.percentage).toBeDefined()
    expect(response.body.percentage).toBe(-1)
    expect(response.status).toBe(200)
  })
  it('Should return 200 when valid product and discount must be applied', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.percentage).toBeDefined()
    expect(response.body.products[0].basePrice).toBe(productData1.basePrice)
    expect(response.body.products[1].basePrice).toBe(productData2.basePrice)
    expect(response.body.products[0].price).toBe(productData1.basePrice + productData1.basePrice * (response.body.percentage / 100.0))
    expect(response.body.products[1].price).toBe(productData2.basePrice + productData2.basePrice * (response.body.percentage / 100.0))
    expect(response.status).toBe(200)
  })
  it('Should return 200 when successfully set a restaurant percentage', async () => {
    let newRestaurantCopy = newRestaurant
    newRestaurantCopy.percentage = 1
    const response = await request(app).put(`/restaurants/${newRestaurantCopy.id}`).set('Authorization', `Bearer ${owner.token}`).send(newRestaurantCopy)
    expect(response.body.percentage).toBe(1)
    expect(response.status).toBe(200)
  })
  it('Should return 200 when valid product and discount must be applied', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.percentage).toBeDefined()
    expect(response.body.products[0].basePrice).toBe(productData1.basePrice)
    expect(response.body.products[1].basePrice).toBe(productData2.basePrice)
    expect(response.body.products[0].price).toBe(productData1.basePrice + productData1.basePrice * (response.body.percentage / 100.0))
    expect(response.body.products[1].price).toBe(productData2.basePrice + productData2.basePrice * (response.body.percentage / 100.0))
    expect(response.status).toBe(200)
  })
  it('Should return 422 when percentage is out of range (negative)', async () => {
    let newRestaurantCopy = newRestaurant
    newRestaurantCopy.percentage = -6
    const response = await request(app).put(`/restaurants/${newRestaurantCopy.id}`).set('Authorization', `Bearer ${owner.token}`).send(newRestaurantCopy)
    expect(response.status).toBe(422)
  })
  it('Should return 200 and the restaurant has to be set with percentage', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.percentage).toBeDefined()
    expect(response.body.percentage).toBe(1)
    expect(response.status).toBe(200)
  })
  it('Should return 422 when percentage is out of range (positive)', async () => {
    let newRestaurantCopy = newRestaurant
    newRestaurantCopy.percentage = 6
    const response = await request(app).put(`/restaurants/${newRestaurantCopy.id}`).set('Authorization', `Bearer ${owner.token}`).send(newRestaurantCopy)
    expect(response.status).toBe(422)
  })
  it('Should return 200 and the restaurant has to be set with percentage', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.percentage).toBeDefined()
    expect(response.body.percentage).toBe(1)
    expect(response.status).toBe(200)
  })
  it('Should return 200 and no discount to restaurant 2 applied', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant2.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.percentage).toBeDefined()
    expect(response.body.products[0].price).toBe(productData3.basePrice)
    expect(response.status).toBe(200)
  })
  it('Should return 404 when trying to set a restaurant already deleted', async () => {
    await request(app).delete(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    const response = await request(app).put(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send(newRestaurant)
    expect(response.status).toBe(404)
  })
  afterAll(async () => {
    await request(app).delete(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    await shutdownApp()
  })
})