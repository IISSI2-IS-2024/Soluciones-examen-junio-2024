import dotenv from 'dotenv'
import request from 'supertest'
import { getApp, shutdownApp } from './utils/testApp'
import { getNewLoggedInCustomer } from './utils/auth'
dotenv.config()

describe('Get public user information', () => {
  let newCustomer, otherCustomer, app
  beforeAll(async () => {
    app = await getApp()
    newCustomer = await getNewLoggedInCustomer()
    otherCustomer = await getNewLoggedInCustomer()
  })
  it('Should return 200 and the user public information when retreiving newly created customer', async () => {
    const response = await request(app).get(`/users/${newCustomer.id}`).set('Authorization', `Bearer ${otherCustomer.token}`).send()
    expect(response.status).toBe(200)
    expect(response.body.id).toBe(newCustomer.id)
    expect(response.body.password).toBeUndefined()
  })
  afterAll(async () => {
    await shutdownApp()
  })
})
