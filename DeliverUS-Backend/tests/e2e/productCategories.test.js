import request from 'supertest'
import { shutdownApp, getApp } from './utils/testApp'

describe('Get all product categories', () => {
  let app
  beforeAll(async () => {
    app = await getApp()
  })
  it('There must be more than one product category', async () => {
    const response = await request(app).get('/productCategories').send()
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBeTruthy()
    expect(response.body).not.toHaveLength(0)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})
