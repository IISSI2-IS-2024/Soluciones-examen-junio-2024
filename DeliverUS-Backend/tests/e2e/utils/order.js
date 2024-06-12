import request from 'supertest'
import { getApp } from './testApp'
import { getFirstRestaurantOfOwner } from './restaurant'
import { createProduct, getNewCervezaProductData, getNewPaellaProductData, getNewUnavailablePaellaProductData } from './product'
import { getLoggedInOwner } from './auth'

const getNewOrderData = async (restaurant, maxTotalPrice = 10, loggedInOwner) => {
  if (!loggedInOwner) loggedInOwner = await getLoggedInOwner()
  const paellaProduct = await getNewPaellaProductData(restaurant)
  const cervezaProduct = await getNewCervezaProductData(restaurant)
  paellaProduct.price = 2
  cervezaProduct.price = 1
  const createdPaellaProduct = await createProduct(loggedInOwner, restaurant, paellaProduct)
  const createdCervezaProduct = await createProduct(loggedInOwner, restaurant, cervezaProduct)
  if (createdCervezaProduct.price !== 1) {
    console.error('Error creating product cerveza. Price', createdCervezaProduct.price, 'and id', createdCervezaProduct.id, 'and restaurant id', restaurant.id)
  }

  const paellaQuantity = 1
  const remainingPrice = maxTotalPrice - createdPaellaProduct.price
  const cervezaQuantity = Math.floor(remainingPrice / createdCervezaProduct.price)

  return {
    address: 'Calle falsa 123',
    restaurantId: restaurant.id,
    products: [
      { productId: createdPaellaProduct.id, quantity: paellaQuantity },
      { productId: createdCervezaProduct.id, quantity: cervezaQuantity }
    ]
  }
}

const getNewOrderDataWithUnavailableProduct = async (restaurant, maxTotalPrice = 10) => {
  const paellaProduct = await getNewUnavailablePaellaProductData(restaurant)
  paellaProduct.price = 1
  const createdPaellaProduct = await createProduct(await getLoggedInOwner(), restaurant, paellaProduct)
  return {
    address: 'Calle falsa 123',
    restaurantId: restaurant.id,
    products: [
      { productId: createdPaellaProduct.id, quantity: Math.floor(maxTotalPrice / createdPaellaProduct.price) }
    ]
  }
}

const getFirstProductFromRestaurant = async (restaurant) => {
  const products = (await request(await getApp()).get(`/restaurants/${restaurant.id}/products`).send()).body
  return products[0]
}

const getProductAlreadyOrdered = async (owner, restaurant) => {
  const orders = (await request(await getApp()).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${owner.token}`).send()).body
  return orders[0].products[0]
}

const createOrder = async (customer, restaurant, orderData) => {
  const owner = await getLoggedInOwner()
  if (!restaurant) { restaurant = await getFirstRestaurantOfOwner(owner) }
  if (!orderData) { orderData = await getNewOrderData(restaurant) }
  const response = await request(await getApp()).post('/orders').set('Authorization', `Bearer ${customer.token}`).send(orderData)
  return response.body
}

async function computeOrderPrice (orderData) {
  let computedOrderPrice = orderData.products.reduce((total, product) => total + product.OrderProducts.unityPrice * product.OrderProducts.quantity, 0)
  if (computedOrderPrice < 10) {
    const fullRestaurant = (await request(await getApp()).get(`/restaurants/${orderData.restaurantId}`).send()).body
    computedOrderPrice += fullRestaurant.shippingCosts
  }
  return computedOrderPrice
}

async function checkOrderEqualsOrderData (createdOrder, orderData) {
  expect(createdOrder.address).toBe(orderData.address)
  expect(createdOrder.restaurantId).toBe(orderData.restaurantId)
  expect(createdOrder.products).toBeDefined()
  expect(createdOrder.products.length).toBe(orderData.products.length)

  const app = await getApp()
  for (const product of createdOrder.products) {
    const matchingProduct = orderData.products.find(p => p.productId === product.id)
    expect(matchingProduct).toBeDefined()
    expect(product.OrderProducts.quantity).toEqual(matchingProduct.quantity)
    const fullProduct = (await request(app).get(`/products/${product.id}`).send()).body
    expect(product.OrderProducts.unityPrice).toEqual(fullProduct.price)
  }
}

export { getNewOrderData, getFirstProductFromRestaurant, getProductAlreadyOrdered, getNewOrderDataWithUnavailableProduct, createOrder, computeOrderPrice, checkOrderEqualsOrderData }
