import dotenv from 'dotenv'
import request from 'supertest'
import { getLoggedInCustomer, getLoggedInOwner } from './utils/auth'
import { checkValidDate } from './utils/date'
import { createRestaurant, getFirstRestaurantOfOwner } from './utils/restaurant'
import { getApp, shutdownApp } from './utils/testApp'
import { bodeguitaRestaurant, invalidRestaurant } from './utils/testData'
dotenv.config()

const _checkRestaurantProperties = (restaurant) => {
  expect(restaurant.name).toBeDefined()
  expect(typeof restaurant.name).toBe('string')
  expect(restaurant.address).toBeDefined()
  expect(typeof restaurant.address).toBe('string')
  expect(restaurant.postalCode).toBeDefined()
  expect(typeof restaurant.postalCode).toBe('string')
  expect(restaurant.shippingCosts).toBeDefined()
  expect(typeof restaurant.shippingCosts).toBe('number')
  expect(restaurant.restaurantCategoryId).toBeDefined()
  expect(Number.isInteger(restaurant.restaurantCategoryId)).toBeTruthy()
  expect(restaurant.createdAt).toBeDefined()
  expect(checkValidDate(restaurant.createdAt)).toBeTruthy()
  expect(restaurant.updatedAt).toBeDefined()
  expect(checkValidDate(restaurant.updatedAt)).toBeTruthy()
  if (restaurant.description !== null) { expect(typeof restaurant.description).toBe('string') }
  if (restaurant.url !== null) { expect(typeof restaurant.url).toBe('string') }
  if (restaurant.averageServiceMinutes !== null) { expect(typeof restaurant.averageServiceMinutes).toBe('number') }
  if (restaurant.email !== null) { expect(typeof restaurant.email).toBe('string') }
  if (restaurant.phone !== null) { expect(typeof restaurant.phone).toBe('string') }
  if (restaurant.logo !== null) { expect(typeof restaurant.logo).toBe('string') }
  if (restaurant.heroImage !== null) { expect(typeof restaurant.heroImage).toBe('string') }
  expect(restaurant.status).toBeDefined()
  expect(['online', 'offline', 'closed', 'temporarily closed']).toContain(restaurant.status)
}

describe('Get restaurant details', () => {
  let restaurantIdToBeShown, app, returnedRestaurant
  beforeAll(async () => {
    app = await getApp()
    restaurantIdToBeShown = 1
  })
  it('Should return 404 with incorrect id', async () => {
    const response = await request(app).get('/restaurants/incorrectId').send()
    expect(response.status).toBe(404)
  })
  it('Should return 200 with correct id', async () => {
    const response = await request(app).get(`/restaurants/${restaurantIdToBeShown}`).send()
    expect(response.status).toBe(200)
    returnedRestaurant = response.body
  })
  it('The restaurant must not include its userId', async () => {
    expect(returnedRestaurant.userId === undefined).toBe(true)
  })
  // eslint-disable-next-line jest/expect-expect
  it('All restaurants properties must be correctly defined', async () => {
    _checkRestaurantProperties(returnedRestaurant)
  })
  it('The restaurant must include products', async () => {
    expect(returnedRestaurant.products !== undefined).toBe(true)
  })
  it('The products of the restaurant must not be empty', async () => {
    expect(returnedRestaurant.products.length > 0).toBe(true)
  })
  it('The restaurant must have a restaurant category', async () => {
    expect(returnedRestaurant.restaurantCategory !== undefined).toBe(true)
  })
  it('The products the restaurant must have a product category', async () => {
    expect(returnedRestaurant.products.every(product => product.productCategory !== undefined)).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get all restaurants', () => {
  let restaurants, app
  beforeAll(async () => {
    app = await getApp()
  })
  it('There must be more than one restaurant', async () => {
    const response = await request(app).get('/restaurants').send()
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBeTruthy()
    expect(response.body).not.toHaveLength(0)
    restaurants = response.body
  })
  it('All restaurants must have an id', async () => {
    expect(restaurants.every(restaurant => restaurant.id !== undefined)).toBe(true)
  })
  it('All restaurants must have a restaurant category', async () => {
    expect(restaurants.every(restaurant => restaurant.restaurantCategory !== undefined)).toBe(true)
  })
  // eslint-disable-next-line jest/expect-expect
  it('All restaurants properties must be correctly defined', async () => {
    restaurants.forEach(restaurant => _checkRestaurantProperties(restaurant))
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get owner restaurants', () => {
  let owner, ownerRestaurants, app
  const fakeToken = 'fakeToken'
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
  })
  it('should not be able to retrieve restaurants with a fake token', async () => {
    const response = await request(app).get('/users/myRestaurants').set('Authorization', `Bearer ${fakeToken}`).send()
    expect(response.status).toBe(401)
  })
  it('should be able to retrieve restaurants with the real token', async () => {
    const response = await request(app).get('/users/myRestaurants').set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
    ownerRestaurants = response.body
  })
  it('The owner must have more than one restaurant', async () => {
    expect(Array.isArray(ownerRestaurants)).toBeTruthy()
    expect(ownerRestaurants).not.toHaveLength(0)
  })
  it('All owner restaurants must have an id', async () => {
    expect(ownerRestaurants.every(restaurant => restaurant.id !== undefined)).toBe(true)
  })
  it('All owner restaurants must have a restaurant category', async () => {
    expect(ownerRestaurants.every(restaurant => restaurant.restaurantCategory !== undefined)).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get owner restaurant details', () => {
  let owner, ownerRestaurantsWithDetails, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    const response = await request(app).get('/users/myRestaurants').set('Authorization', `Bearer ${owner.token}`).send()
    const ownerRestaurantsWithoutDetails = response.body
    ownerRestaurantsWithDetails = await Promise.all(ownerRestaurantsWithoutDetails.map(async restaurantWithoutDetails => {
      const response = await request(app).get(`/restaurants/${restaurantWithoutDetails.id}`).send()
      return response.body
    }))
  })
  it('Should return 404 with incorrect id', async () => {
    const response = await request(app).get('/restaurants/incorrectId').send()
    expect(response.status).toBe(404)
  })
  it('The restaurants of owner 1 must not include its userId', async () => {
    expect(ownerRestaurantsWithDetails.every(restaurant => restaurant.userId === undefined)).toBe(true)
  })
  it('The restaurants of owner 1 must include products', async () => {
    expect(ownerRestaurantsWithDetails.every(restaurant => restaurant.products !== undefined)).toBe(true)
  })
  it('The products of the first two restaurants of owner 1 must not be empty', async () => {
    expect(ownerRestaurantsWithDetails.slice(0, 2).every(restaurant => restaurant.products.length > 0)).toBe(true)
  })
  it('The products of the first two restaurants of owner 1 must have a product category', async () => {
    expect(ownerRestaurantsWithDetails.slice(0, 2).every(restaurant => restaurant.products.every(product => product.productCategory !== undefined))).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Create restaurant', () => {
  let owner, customer, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).post('/restaurants').send(invalidRestaurant)
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).post('/restaurants').set('Authorization', `Bearer ${customer.token}`).send(invalidRestaurant)
    expect(response.status).toBe(403)
  })
  it('Should return 200 when valid restaurant', async () => {
    const validRestaurant = { ...bodeguitaRestaurant }
    validRestaurant.restaurantCategoryId = (await request(app).get('/restaurantCategories').send()).body[0].id
    const response = await request(app).post('/restaurants').set('Authorization', `Bearer ${owner.token}`).send(validRestaurant)
    expect(response.status).toBe(200)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

// FCM: Restaurant Category ID hard-coded to 1
describe('Create restaurant validations', () => {
  let app, owner, validRestaurantData

  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    validRestaurantData = {
      name: 'Valid Restaurant',
      description: 'A valid description',
      address: '123 Valid Street',
      postalCode: '12345',
      url: 'http://www.validrestaurant.com',
      shippingCosts: 5.0,
      email: 'contact@validrestaurant.com',
      phone: '1234567890',
      restaurantCategoryId: 1
    }
  })

  // Name validations
  it.each([
    { field: 'name', value: '', msg: 'empty' },
    { field: 'name', value: ' '.repeat(256), msg: 'more than 255 chars' },
    { field: 'name', value: 123, msg: 'not a string' }
  ])('Should return 422 when name is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // Description validations
  it('Should return 200 even when description is omitted (optional)', async () => {
    const { description, ...dataWithoutDescription } = validRestaurantData
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(dataWithoutDescription)
    expect(response.status).toBe(200)
  })

  it.each([
    { field: 'description', value: 123, msg: 'not a string' }
  ])('Should return 422 when description is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // Address validations
  it.each([
    { field: 'address', value: '', msg: 'empty' },
    { field: 'address', value: ' '.repeat(256), msg: 'more than 255 chars' },
    { field: 'address', value: 123, msg: 'not a string' }
  ])('Should return 422 when address is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // PostalCode validations
  it.each([
    { field: 'postalCode', value: '', msg: 'empty' },
    { field: 'postalCode', value: ' '.repeat(256), msg: 'more than 255 chars' },
    { field: 'postalCode', value: 123, msg: 'not a string' }
  ])('Should return 422 when postalCode is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // URL validations
  it.each([
    { field: 'url', value: 'justastring', msg: 'invalid URL' },
    { field: 'url', value: 123, msg: 'not a string' }
  ])('Should return 422 when url is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // ShippingCosts validations
  it.each([
    { field: 'shippingCosts', value: -1, msg: 'negative' },
    { field: 'shippingCosts', value: 'notanumber', msg: 'not a number' }
  ])('Should return 422 when shippingCosts is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // Email validations
  it.each([
    { field: 'email', value: 'notanemail', msg: 'invalid email' },
    { field: 'email', value: 123, msg: 'not a string' }
  ])('Should return 422 when email is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // Phone validations
  it.each([
    { field: 'phone', value: ' '.repeat(256), msg: 'more than 255 chars' },
    { field: 'phone', value: 123, msg: 'not a string' }
  ])('Should return 422 when phone is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // restaurantCategoryId validations
  it.each([
    { field: 'restaurantCategoryId', value: undefined, msg: 'missing' },
    { field: 'restaurantCategoryId', value: null, msg: 'null' },
    { field: 'restaurantCategoryId', value: 'not-an-integer', msg: 'not an integer' },
    { field: 'restaurantCategoryId', value: 0, msg: 'less than 1' }
  ])('Should return 422 when restaurantCategoryId is $msg', async ({ field, value }) => {
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // userId validation
  it('Should return 422 when userId is included in the request body', async () => {
    const invalidData = { ...validRestaurantData, userId: 2 }
    const response = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(invalidData)
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === 'userId')).toBe(true)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Edit restaurant', () => {
  let owner, customer, newRestaurant, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
    const validRestaurant = { ...bodeguitaRestaurant }
    validRestaurant.restaurantCategoryId = (await request(app).get('/restaurantCategories').send()).body[0].id
    newRestaurant = (await request(app).post('/restaurants').set('Authorization', `Bearer ${owner.token}`).send(validRestaurant)).body
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).put(`/restaurants/${newRestaurant.id}`).send(invalidRestaurant)
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).put(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${customer.token}`).send(invalidRestaurant)
    expect(response.status).toBe(403)
  })
  it('Should return 403 when trying to edit a restaurant that is not yours', async () => {
    const restaurantNotOwned = await createRestaurant()
    const { userId, ...editedRestaurantNotOwned } = restaurantNotOwned
    editedRestaurantNotOwned.name = `${editedRestaurantNotOwned.name} updated`
    const response = await request(app).put(`/restaurants/${restaurantNotOwned.id}`).set('Authorization', `Bearer ${owner.token}`).send(editedRestaurantNotOwned)
    expect(response.status).toBe(403)
  })
  it('Should return 200 when valid restaurant', async () => {
    const { userId, ...editedRestaurant } = newRestaurant
    editedRestaurant.name = `${newRestaurant.name} updated`
    const response = await request(app).put(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send(editedRestaurant)
    expect(response.status).toBe(200)
    expect(response.body.name).toBe(`${newRestaurant.name} updated`)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

// FCM: restaurantId of restaurant edited hard-coded to 1
// FCM: restaurantCategoryId hard-coded to 1
describe('Edit restaurant validations', () => {
  let app, owner, validRestaurantData

  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    validRestaurantData = {
      name: 'Valid Restaurant',
      description: 'A valid description',
      address: '123 Valid Street',
      postalCode: '12345',
      url: 'http://www.validrestaurant.com',
      shippingCosts: 5.0,
      email: 'contact@validrestaurant.com',
      phone: '1234567890',
      restaurantCategoryId: 1
    }
  })

  // Name validations
  it.each([
    { field: 'name', value: '', msg: 'empty' },
    { field: 'name', value: ' '.repeat(256), msg: 'more than 255 chars' },
    { field: 'name', value: 123, msg: 'not a string' }
  ])('Should return 422 when name is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // Description validations
  it('Should return 200 even when description is omitted (optional)', async () => {
    const { description, ...dataWithoutDescription } = validRestaurantData
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(dataWithoutDescription)
    expect(response.status).toBe(200)
  })

  it.each([
    { field: 'description', value: 123, msg: 'not a string' }
  ])('Should return 422 when description is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // Address validations
  it.each([
    { field: 'address', value: '', msg: 'empty' },
    { field: 'address', value: ' '.repeat(256), msg: 'more than 255 chars' },
    { field: 'address', value: 123, msg: 'not a string' }
  ])('Should return 422 when address is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // PostalCode validations
  it.each([
    { field: 'postalCode', value: '', msg: 'empty' },
    { field: 'postalCode', value: ' '.repeat(256), msg: 'more than 255 chars' },
    { field: 'postalCode', value: 123, msg: 'not a string' }
  ])('Should return 422 when postalCode is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // URL validations
  it.each([
    { field: 'url', value: 'justastring', msg: 'invalid URL' },
    { field: 'url', value: 123, msg: 'not a string' }
  ])('Should return 422 when url is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // ShippingCosts validations
  it.each([
    { field: 'shippingCosts', value: -1, msg: 'negative' },
    { field: 'shippingCosts', value: 'notanumber', msg: 'not a number' }
  ])('Should return 422 when shippingCosts is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // Email validations
  it.each([
    { field: 'email', value: 'notanemail', msg: 'invalid email' },
    { field: 'email', value: 123, msg: 'not a string' }
  ])('Should return 422 when email is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // Phone validations
  it.each([
    { field: 'phone', value: ' '.repeat(256), msg: 'more than 255 chars' },
    { field: 'phone', value: 123, msg: 'not a string' }
  ])('Should return 422 when phone is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // restaurantCategoryId validations
  it.each([
    { field: 'restaurantCategoryId', value: undefined, msg: 'missing' },
    { field: 'restaurantCategoryId', value: null, msg: 'null' },
    { field: 'restaurantCategoryId', value: 'not-an-integer', msg: 'not an integer' },
    { field: 'restaurantCategoryId', value: 0, msg: 'less than 1' }
  ])('Should return 422 when restaurantCategoryId is $msg', async ({ field, value }) => {
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validRestaurantData, [field]: value })
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === field)).toBe(true)
  })

  // userId validation
  it('Should return 422 when userId is included in the request body', async () => {
    const invalidData = { ...validRestaurantData, userId: 2 }
    const response = await request(app)
      .put('/restaurants/1')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(invalidData)
    expect(response.status).toBe(422)
    expect(response.body.errors.some(error => error.param === 'userId')).toBe(true)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Remove restaurant', () => {
  let owner, customer, newRestaurant, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
    const validRestaurant = { ...bodeguitaRestaurant }
    validRestaurant.restaurantCategoryId = (await request(app).get('/restaurantCategories').send()).body[0].id
    newRestaurant = (await request(app).post('/restaurants').set('Authorization', `Bearer ${owner.token}`).send(validRestaurant)).body
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).delete(`/restaurants/${newRestaurant.id}`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).delete(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when trying to delete a restaurant that is not yours', async () => {
    const restaurantNotOwned = await createRestaurant()
    const response = await request(app).delete(`/restaurants/${restaurantNotOwned.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 409 when removing a restaurant with orders', async () => {
    const restaurantWithOrders = (await request(app).get('/users/myRestaurants').set('Authorization', `Bearer ${owner.token}`).send()).body[0]
    const response = await request(app).delete(`/restaurants/${restaurantWithOrders.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(409)
  })
  it('Should return 200 when valid restaurant', async () => {
    const response = await request(app).delete(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
  })
  it('Should return 404 when trying to delete a restaurant already deleted', async () => {
    const response = await request(app).delete(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(404)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get analytics restaurant', () => {
  let owner, restaurant, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
  })
  it('Should return 403 when trying to delete a restaurant that is not yours', async () => {
    const restaurantNotOwned = await createRestaurant()
    const response = await request(app).delete(`/restaurants/${restaurantNotOwned.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 200 when valid restaurant', async () => {
    const response = await request(app).get(`/restaurants/${restaurant.id}/analytics`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
  })
  // TODO: Improve analytics tests
  afterAll(async () => {
    await shutdownApp()
  })
})
