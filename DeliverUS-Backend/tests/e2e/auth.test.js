import request from 'supertest'
import { shutdownApp, getApp } from './utils/testApp'
import { customerCredentials, noEmailCustomerCredentials, ownerCredentials, noEmailOwnerCredentials, invalidCredentials, generateFakeUser } from './utils/testData'
describe('Login owner', () => {
  let authTokenOwner, app
  beforeAll(async () => {
    app = await getApp()
  })
  it('Login owner should return 422 if no email is provided', async () => {
    const response = await request(app).post('/users/loginOwner').send(noEmailOwnerCredentials)
    expect(response.status).toBe(422)
  })
  it('should return a 401 status code for invalid credentials', async () => {
    const response = await request(app).post('/users/loginOwner').send(invalidCredentials)
    expect(response.status).toBe(401)
  })
  it('should return a 200 status code upon successful login', async () => {
    const response = await request(app).post('/users/loginOwner').send(ownerCredentials)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({
      token: expect.any(String),
      id: expect.any(Number)
    }))
    authTokenOwner = response.body.token
  })
  it('should return a valid token upon successful owner login', async () => {
    expect(authTokenOwner).toBeDefined()
    expect(typeof authTokenOwner).toBe('string')
    const response = await request(app).put('/users/isTokenValid').send({
      token: authTokenOwner
    })
    expect(response.status).toBe(200)
  })
})
describe('Login customer', () => {
  let authTokenCustomer, app
  beforeAll(async () => {
    app = await getApp()
  })
  it('Login customer should return 422 if no email is provided', async () => {
    const response = await request(app).post('/users/login').send(noEmailCustomerCredentials)
    expect(response.status).toBe(422)
  })
  it('should return a 401 status code for invalid credentials', async () => {
    const response = await request(app).post('/users/login').send(invalidCredentials)
    expect(response.status).toBe(401)
  })
  it('should return a 200 status code upon successful login', async () => {
    const response = await request(app).post('/users/login').send(customerCredentials)
    expect(response.status).toBe(200)
    authTokenCustomer = response.body.token
  })
  it('should return a valid token upon successful login', async () => {
    expect(authTokenCustomer).toBeDefined()
    expect(typeof authTokenCustomer).toBe('string')
    const response = await request(app).put('/users/isTokenValid').send({
      token: authTokenCustomer
    })
    expect(response.status).toBe(200)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Register new customer', () => {
  let fakeCustomer, app
  beforeAll(async () => {
    fakeCustomer = await generateFakeUser()
    app = await getApp()
  })

  it('should return a 422 when no email is provided', async () => {
    const response = await request(app).post('/users/register').send(noEmailCustomerCredentials)
    expect(response.status).toBe(422)
    expect(response.body).toEqual(expect.objectContaining({
      errors: expect.arrayContaining([])
    }))
  })
  it('should return a 200 status code when successful register', async () => {
    const response = await request(app).post('/users/register').send(fakeCustomer)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number)
    }))
  })
  it('should be able to login customer after registered', async () => {
    const response = await request(app).post('/users/login').send({ email: fakeCustomer.email, password: fakeCustomer.password })
    expect(response.status).toBe(200)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Register new owner', () => {
  let fakeOwner, app
  beforeAll(async () => {
    fakeOwner = await generateFakeUser()
    app = await getApp()
  })

  it('should return a 422 when no email is provided', async () => {
    const response = await request(app).post('/users/registerOwner').send(noEmailOwnerCredentials)
    expect(response.status).toBe(422)
    expect(response.body).toEqual(expect.objectContaining({
      errors: expect.arrayContaining([])
    }))
  })
  it('should return a 200 status code when successful register', async () => {
    const response = await request(app).post('/users/registerOwner').send(fakeOwner)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number)
    }))
  })
  it('should be able to login owner after registered', async () => {
    const response = await request(app).post('/users/loginOwner').send({ email: fakeOwner.email, password: fakeOwner.password })
    expect(response.status).toBe(200)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Delete account - owner', () => {
  let registeredOwnerToken, fakeOwner, app
  beforeAll(async () => {
    fakeOwner = await generateFakeUser()
    app = await getApp()
    await request(app).post('/users/registerOwner').send(fakeOwner)
  })
  it('should able to login owner after account registered', async () => {
    const response = await request(app).post('/users/loginOwner').send({ email: fakeOwner.email, password: fakeOwner.password })
    expect(response.status).toBe(200)
    registeredOwnerToken = response.body.token
  })
  it('should be able to delete account afer owner registered', async () => {
    const response = await request(app).delete('/users').set('Authorization', `Bearer ${registeredOwnerToken}`).send()
    expect(response.status).toBe(200)
  })
  it('should not able to login owner after account deleted', async () => {
    const response = await request(app).post('/users/loginOwner').send({ email: fakeOwner.email, password: fakeOwner.password })
    expect(response.status).toBe(401)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Edit logged user - customer', () => {
  let registeredCustomer, fakeCustomer, fakeCustomerEdited, modifiedCustomer, app

  beforeAll(async () => {
    fakeCustomer = await generateFakeUser()
    app = await getApp()
    await request(app).post('/users/register').send(fakeCustomer)
  })
  it('should be able to login customer after account registered', async () => {
    const response = await request(app).post('/users/login').send({ email: fakeCustomer.email, password: fakeCustomer.password })
    expect(response.status).toBe(200)
    registeredCustomer = response.body
  })
  it('customer data should have been modified', async () => {
    fakeCustomerEdited = await generateFakeUser()
    delete fakeCustomerEdited.email
    delete fakeCustomerEdited.password
    fakeCustomerEdited.userType = 'customer'
    const response = await request(app).put('/users').set('Authorization', `Bearer ${registeredCustomer.token}`).send(fakeCustomerEdited)
    expect(response.status).toBe(200)
    modifiedCustomer = response.body
    expect(modifiedCustomer.firstName).toBe(fakeCustomerEdited.firstName)
    expect(modifiedCustomer.lastName).toBe(fakeCustomerEdited.lastName)
    expect(modifiedCustomer.phone).toBe(fakeCustomerEdited.phone)
    expect(modifiedCustomer.address).toBe(fakeCustomerEdited.address)
    expect(modifiedCustomer.postalCode).toBe(fakeCustomerEdited.postalCode)
  })
  it('should be able to login after account modification', async () => {
    const response = await request(app).post('/users/login').send({ email: fakeCustomer.email, password: fakeCustomer.password })
    expect(response.status).toBe(200)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})
