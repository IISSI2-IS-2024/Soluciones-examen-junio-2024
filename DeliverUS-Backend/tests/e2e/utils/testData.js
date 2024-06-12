import { faker } from '@faker-js/faker'

const ownerCredentials = {
  email: 'owner1@owner.com',
  password: 'secret'
}

const noEmailOwnerCredentials = {
  password: 'secret'
}

const customerCredentials = {
  email: 'customer1@customer.com',
  password: 'secret'
}

const noEmailCustomerCredentials = {
  password: 'secret'
}

const invalidCredentials = {
  email: 'invalidCredential@customer.com',
  password: 'secret'
}

const invalidRestaurant = {
  name: 'tooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongAName',
  description: 'Sevillian food',
  address: 'tooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongAName',
  postalCode: 'tooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongANametooLongAName',
  url: 'invalidUrl',
  email: 'invalidEmail',
  phone: '123',
  shippingCosts: -1,
  restaurantCategoryId: 'notValid'
}

const bodeguitaRestaurant = {
  name: 'Bodeguita Antonio Romero',
  description: 'Comida Sevillana',
  address: 'Calle Antonia Díaz, 19',
  postalCode: '41001',
  url: 'http://www.bodeguitasantonioromero.com/',
  email: 'info@bodeguitasantonioromero.com',
  phone: '+34654223939',
  shippingCosts: 3.5
}

const paellaProduct = {
  name: 'Paella',
  description: 'De marisco',
  price: 5,
  order: 4,
  availability: true
}

const review = {
  title: 'Very tasty',
  body: 'I loved it!  I will repeat for sure! I recommend it to everyone!',
  stars: 5
}

const cervezaProduct = {
  name: 'Cerveza',
  description: '5% alcohol',
  price: 2,
  order: 5,
  availability: true
}

const generateFakeUser = async (name) => {
  const firstName = name || faker.name.firstName()
  const lastName = faker.name.lastName()
  const email = faker.internet.email(firstName, lastName)
  const password = '12345678AaBb_!'
  const phone = faker.phone.number()
  const avatar = faker.internet.avatar() + `?timestamp=${Math.floor(Math.random() * 100)}`
  const address = `${faker.address.streetAddress()}, ${faker.address.cityName()}, ${faker.address.country()}.`
  const postalCode = faker.address.zipCode()
  const userType = faker.helpers.arrayElement(['customer', 'owner'])
  const createdAt = new Date()
  const updatedAt = createdAt
  return { firstName, lastName, email, password, phone, avatar, address, postalCode, userType, createdAt, updatedAt }
}

export { ownerCredentials, customerCredentials, noEmailCustomerCredentials, noEmailOwnerCredentials, invalidCredentials, invalidRestaurant, bodeguitaRestaurant, paellaProduct, cervezaProduct, review, generateFakeUser }
