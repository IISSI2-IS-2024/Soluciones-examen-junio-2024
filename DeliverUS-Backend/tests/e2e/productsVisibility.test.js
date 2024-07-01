import request from 'supertest'
import { shutdownApp, getApp } from './utils/testApp.js'
import { getLoggedInOwner } from './utils/auth.js'
import { getFirstRestaurantOfOwner } from './utils/restaurant.js'
import { getNewPaellaProductData } from './utils/product.js'
import { Product } from '../../src/models/models.js'

import dotenv from 'dotenv'
dotenv.config()

describe('Get restaurant products', () => {
  let restaurant, app, owner
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
  })
  it('Not visible products should not be listed', async () => {
    const notVisibleProduct = await getNewPaellaProductData(restaurant)
    const visibleDate = new Date()

    visibleDate.setDate(visibleDate.getDate() - 1)

    notVisibleProduct.visibleUntil = visibleDate

    let newProduct = Product.build(notVisibleProduct)
    newProduct = await newProduct.save()

    const responseRestaurant = await request(app).get(`/restaurants/${restaurant.id}`).send()
    expect(responseRestaurant.status).toBe(200)

    expect(responseRestaurant.body.products.every(product => product.id !== newProduct.id)).toBe(true)
  })
  it('Visible products should be listed', async () => {
    const visibleProduct = await getNewPaellaProductData(restaurant)
    const visibleDate = new Date()

    visibleDate.setDate(visibleDate.getDate() + 1)

    visibleProduct.visibleUntil = visibleDate

    let newProduct = Product.build(visibleProduct)
    newProduct = await newProduct.save()

    const responseRestaurant = await request(app).get(`/restaurants/${restaurant.id}`).send()
    expect(responseRestaurant.status).toBe(200)

    expect(responseRestaurant.body.products.some(product => product.id === newProduct.id)).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Create product', () => {
  let owner, productData, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    const restaurant = await getFirstRestaurantOfOwner(owner)
    productData = await getNewPaellaProductData(restaurant)
  })
  it('Should return 422 when visibleUntil is before today', async () => {
    const invalidProduct = { ...productData }
    const visibleUntil = new Date()

    visibleUntil.setDate(visibleUntil.getDate() - 1)

    invalidProduct.visibleUntil = visibleUntil
    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(invalidProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['visibleUntil'].some(field => errorFields.includes(field))).toBe(true)
  })
  it('Should return 422 when setting availability to false and visibleUntil at the same time', async () => {
    const invalidProduct = { ...productData }

    const visibleUntil = new Date()

    visibleUntil.setDate(visibleUntil.getDate() + 1)

    invalidProduct.visibleUntil = visibleUntil

    invalidProduct.availability = false

    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(invalidProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['availability'].every(field => errorFields.includes(field))).toBe(true)
  })
  it('Should return 422 when visibleUntil is not a date', async () => {
    const invalidProduct = { ...productData }

    invalidProduct.visibleUntil = 'BADFORMAT'
    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(invalidProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['visibleUntil'].every(field => errorFields.includes(field))).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Edit product', () => {
  let owner, productData, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    const restaurant = await getFirstRestaurantOfOwner(owner)
    productData = await getNewPaellaProductData(restaurant)
  })
  it('Should return 422 when visibleUntil is before today', async () => {
    const invalidProduct = { ...productData }
    const visibleUntil = new Date()

    visibleUntil.setDate(visibleUntil.getDate() - 1)

    invalidProduct.visibleUntil = visibleUntil
    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(invalidProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['visibleUntil'].some(field => errorFields.includes(field))).toBe(true)
  })
  it('Should return 422 when setting availability to false and visibleUntil at the same time', async () => {
    const invalidProduct = { ...productData }

    const visibleUntil = new Date()

    visibleUntil.setDate(visibleUntil.getDate() + 1)

    invalidProduct.visibleUntil = visibleUntil

    invalidProduct.availability = false

    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(invalidProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['availability'].every(field => errorFields.includes(field))).toBe(true)
  })
  it('Should return 422 when visibleUntil is not a date', async () => {
    const invalidProduct = { ...productData }

    invalidProduct.visibleUntil = 'BADFORMAT'
    const response = await request(app).post('/products').set('Authorization', `Bearer ${owner.token}`).send(invalidProduct)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['visibleUntil'].every(field => errorFields.includes(field))).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})
