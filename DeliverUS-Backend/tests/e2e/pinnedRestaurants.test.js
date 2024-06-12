import { getApp, shutdownApp } from './utils/testApp'
import { bodeguitaRestaurant } from './utils/testData'
import { getLoggedInCustomer, getLoggedInOwner } from './utils/auth'
import { createRestaurant } from './utils/restaurant'

import request from 'supertest'

let totalScore = 0 // Variable global para mantener la puntuación

const testWeights = {
  'To pin or unpin a restaurant. Should return 401 if not logged in': 0.25,
  'To pin or unpin a restaurant. Should return 403 when logged in as a customer': 0.25,
  'To pin or unpin a restaurant. Should return 403 when trying to pin a restaurant that is not yours': 0.25,
  'To pin or unpin a restaurant. Should return 200 when successfully pinned a restaurant': 0.25,
  'To pin or unpin a restaurant. Should return 200 and the pinnedAt property has been persisted': 0.25,
  'To pin or unpin a restaurant. Should return 200 when successfully unpinned a restaurant': 0.25,
  'To pin or unpin a restaurant. Should return 200 and and the pinnedAt property has been persisted': 0.25,
  'To pin or unpin a restaurant. Should return 404 when trying to pin a deleted restaurant': 0.25,
  'Create restaurant (pinned or not pinned) Should return 422 when invalid pinned restaurant data': 0.5,
  'Create restaurant (pinned or not pinned) Should return 200 when restaurant has no pinned data and the created restaurant must not be pinned': 0.5,
  'Create restaurant (pinned or not pinned) Should return 200 and the pinned restaurant when trying to create a new pinned restaurant)': 0.5,
  'Create restaurant (pinned or not pinned) Should return 200 and the pinned restaurant when trying to create a new NOT pinned restaurant)': 0.5,
  'Restaurant listing order Should list all pinned restaurants from oldest to newest before any non-pinned ones on /users/myRestaurants': 1
}

// Este bloque global maneja la puntuación a través de todas las suites
afterEach(() => {
  const testState = expect.getState()
  const testName = testState.currentTestName
  if (testName) {
    totalScore += testWeights[testName] * testState.numPassingAsserts / testState.assertionCalls
  } else {
    console.error('Test not found')
  }
})

afterAll(() => {
  console.log(`Total Score: ${totalScore}`) // Imprime la puntuación total después de todas las pruebas
})

describe('To pin or unpin a restaurant.', () => {
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
    const response = await request(app).patch(`/restaurants/${newRestaurant.id}/togglePinned`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).patch(`/restaurants/${newRestaurant.id}/togglePinned`).set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when trying to pin a restaurant that is not yours', async () => {
    const restaurantNotOwned = await createRestaurant()
    const response = await request(app).patch(`/restaurants/${restaurantNotOwned.id}/togglePinned`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 200 when successfully pinned a restaurant', async () => {
    const response = await request(app).patch(`/restaurants/${newRestaurant.id}/togglePinned`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
  })
  it('Should return 200 and the pinnedAt property has been persisted', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.pinnedAt).toBeDefined()
    expect(response.body.pinnedAt).not.toBeNull()
    expect(response.status).toBe(200)
  })
  it('Should return 200 when successfully unpinned a restaurant', async () => {
    const response = await request(app).patch(`/restaurants/${newRestaurant.id}/togglePinned`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
  })
  it('Should return 200 and and the pinnedAt property has been persisted', async () => {
    const response = await request(app).get(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.pinnedAt).toBeDefined()
    expect(response.body.pinnedAt).toBeNull()
    expect(response.status).toBe(200)
  })
  it('Should return 404 when trying to pin a deleted restaurant', async () => {
    await request(app).delete(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    const response = await request(app).patch(`/restaurants/${newRestaurant.id}/togglePinned`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(404)
  })

  afterAll(async () => {
    await request(app).delete(`/restaurants/${newRestaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    await shutdownApp()
  })
})

describe('Create restaurant (pinned or not pinned)', () => {
  let owner, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
  })

  it('Should return 422 when invalid pinned restaurant data', async () => {
    const notValidRestaurant = { ...bodeguitaRestaurant }
    notValidRestaurant.pinned = 'invalidPinnedValue'
    const response = await request(app).post('/restaurants').set('Authorization', `Bearer ${owner.token}`).send(notValidRestaurant)
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(['pinned'].every(field => errorFields.includes(field))).toBe(true)
  })

  it('Should return 200 when restaurant has no pinned data and the created restaurant must not be pinned', async () => {
    const validPinnedRestaurant = { ...bodeguitaRestaurant }
    validPinnedRestaurant.restaurantCategoryId = (await request(app).get('/restaurantCategories').send()).body[0].id
    const response = await request(app).post('/restaurants').set('Authorization', `Bearer ${owner.token}`).send(validPinnedRestaurant)
    const restaurantId = response.body.id
    const detailResponse = await request(app).get(`/restaurants/${restaurantId}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(detailResponse.body.pinnedAt).toBeDefined()
    expect(detailResponse.body.pinnedAt).toBeNull()
    expect(detailResponse.status).toBe(200)
    await request(app).delete(`/restaurants/${restaurantId}`).set('Authorization', `Bearer ${owner.token}`).send()
  })

  it('Should return 200 and the pinned restaurant when trying to create a new pinned restaurant)', async () => {
    const validPinnedRestaurant = { ...bodeguitaRestaurant }
    validPinnedRestaurant.restaurantCategoryId = (await request(app).get('/restaurantCategories').send()).body[0].id
    validPinnedRestaurant.pinned = true
    const response = await request(app).post('/restaurants').set('Authorization', `Bearer ${owner.token}`).send(validPinnedRestaurant)
    const restaurantId = response.body.id
    const detailResponse = await request(app).get(`/restaurants/${restaurantId}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(detailResponse.body.pinnedAt).toBeDefined()
    expect(detailResponse.body.pinnedAt).not.toBeNull()
    expect(detailResponse.status).toBe(200)
    await request(app).delete(`/restaurants/${restaurantId}`).set('Authorization', `Bearer ${owner.token}`).send()
  })

  it('Should return 200 and the pinned restaurant when trying to create a new NOT pinned restaurant)', async () => {
    const validPinnedRestaurant = { ...bodeguitaRestaurant }
    validPinnedRestaurant.restaurantCategoryId = (await request(app).get('/restaurantCategories').send()).body[0].id
    validPinnedRestaurant.pinned = false
    const response = await request(app).post('/restaurants').set('Authorization', `Bearer ${owner.token}`).send(validPinnedRestaurant)
    const restaurantId = response.body.id
    const detailResponse = await request(app).get(`/restaurants/${restaurantId}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(detailResponse.body.pinnedAt).toBeDefined()
    expect(detailResponse.body.pinnedAt).toBeNull()
    expect(detailResponse.status).toBe(200)
    await request(app).delete(`/restaurants/${restaurantId}`).set('Authorization', `Bearer ${owner.token}`).send()
  })
})

describe('Restaurant listing order', () => {
  let app; let owner; let restaurants = []

  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()

    for (let i = 0; i < 10; i++) {
      const restaurant = await createRestaurant(owner)
      restaurants.push(restaurant)
    }

    await request(app).patch(`/restaurants/${restaurants[0].id}/togglePinned`).set('Authorization', `Bearer ${owner.token}`).send()
    await request(app).patch(`/restaurants/${restaurants[1].id}/togglePinned`).set('Authorization', `Bearer ${owner.token}`).send()
    await request(app).patch(`/restaurants/${restaurants[8].id}/togglePinned`).set('Authorization', `Bearer ${owner.token}`).send()
    await request(app).patch(`/restaurants/${restaurants[9].id}/togglePinned`).set('Authorization', `Bearer ${owner.token}`).send()
  })

  it('Should list all pinned restaurants from oldest to newest before any non-pinned ones on /users/myRestaurants', async () => {
    const response = await request(app).get('/users/myRestaurants').set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)

    const lastPinnedIndex = response.body.map(r => r.pinnedAt !== null).lastIndexOf(true)
    const firstNonPinnedIndex = response.body.findIndex(r => r.pinnedAt === null)

    expect(lastPinnedIndex).toBeLessThan(firstNonPinnedIndex)

    const pinnedRestaurants = response.body.filter(r => r.pinnedAt !== null)
    let isSortedCorrectly = true
    for (let i = 0; i < pinnedRestaurants.length - 1; i++) {
      if (new Date(pinnedRestaurants[i].pinnedAt) > new Date(pinnedRestaurants[i + 1].pinnedAt)) {
        isSortedCorrectly = false
        break
      }
    }
    expect(isSortedCorrectly).toBeTruthy()
  })

  afterAll(async () => {
    for (const restaurant of restaurants) {
      await request(app).delete(`/restaurants/${restaurant.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    }
    restaurants = []
    await shutdownApp()
  })
})
