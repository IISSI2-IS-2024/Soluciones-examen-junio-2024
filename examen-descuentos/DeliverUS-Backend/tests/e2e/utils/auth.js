import request from 'supertest'
import { ownerCredentials, customerCredentials, generateFakeUser } from './testData'
import { getApp } from './testApp'

let loggedInOwner, loggedInCustomer

const getNewLoggedInOwner = async () => {
  const fakeOwner = await generateFakeUser()
  await request(await getApp()).post('/users/registerOwner').send(fakeOwner)
  return (await request(await getApp()).post('/users/loginOwner').send({ email: fakeOwner.email, password: fakeOwner.password })).body
}

const getLoggedInOwner = async () => {
  if (loggedInOwner) return loggedInOwner
  const response = await request(await getApp()).post('/users/loginOwner').send(ownerCredentials)
  loggedInOwner = response.body
  return loggedInOwner
}

const getLoggedInCustomer = async () => {
  if (loggedInCustomer) return loggedInCustomer
  const response = await request(await getApp()).post('/users/login').send(customerCredentials)
  loggedInCustomer = response.body
  return loggedInCustomer
}

const getNewLoggedInCustomer = async (name) => {
  const fakeCustomer = await generateFakeUser(name)
  await request(await getApp()).post('/users/register').send(fakeCustomer)
  const getLoggedInCustomer = (await request(await getApp()).post('/users/login').send({ email: fakeCustomer.email, password: fakeCustomer.password })).body
  return getLoggedInCustomer
}

export { getLoggedInOwner, getNewLoggedInOwner, getLoggedInCustomer, getNewLoggedInCustomer }
