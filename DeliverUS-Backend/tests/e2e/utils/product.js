import request from 'supertest'
import { getApp } from './testApp'
import { paellaProduct, cervezaProduct } from './testData'
import { getRandomRestaurant } from './restaurant'
let productCategories
const createProduct = async (owner, restaurant, productData) => {
  if (!productData) { productData = await getNewPaellaProductData(restaurant) }
  const response = await request(await getApp()).post('/products').set('Authorization', `Bearer ${owner.token}`).send(productData)
  return response.body
}

const getRandomProductCategory = async () => {
  if (!productCategories) {
    productCategories = (await request(await getApp()).get('/productCategories').send()).body
  }
  return productCategories[Math.floor(Math.random() * productCategories.length)]
}

const getNewPaellaProductData = async (restaurant) => {
  const newProduct = { ...paellaProduct }
  if (!restaurant) { restaurant = await getRandomRestaurant() }
  newProduct.restaurantId = restaurant.id
  newProduct._productCategoryId = (await getRandomProductCategory()).id
  newProduct.productCategoryId = newProduct._productCategoryId
  return newProduct
}

const getNewCervezaProductData = async (restaurant) => {
  const newProduct = { ...cervezaProduct }
  if (!restaurant) { restaurant = await getRandomRestaurant() }
  newProduct.restaurantId = restaurant.id
  newProduct._productCategoryId = (await getRandomProductCategory()).id
  newProduct.productCategoryId = newProduct._productCategoryId
  return newProduct
}

const getNewUnavailablePaellaProductData = async (restaurant) => {
  const newProduct = { ...paellaProduct }
  if (!restaurant) { restaurant = await getRandomRestaurant() }
  newProduct.restaurantId = restaurant.id
  newProduct._productCategoryId = (await getRandomProductCategory()).id
  newProduct.productCategoryId = newProduct._productCategoryId
  newProduct.availability = false
  return newProduct
}

const getFirstProductFromRestaurant = async (restaurant) => {
  return (await getProductsFromRestaurant(restaurant, 1))[0]
}

const getProductsFromRestaurant = async (restaurant, limit = 1) => {
  const products = (await request(await getApp()).get(`/restaurants/${restaurant.id}/products`).send()).body
  return products.slice(0, limit)
}

const getProductAlreadyOrdered = async (owner, restaurant) => {
  const orders = (await request(await getApp()).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${owner.token}`).send()).body
  return orders[0].products[0]
}

const productHasCorrectAvgStars = (product) => {
  if (product.reviews && product.reviews.length > 0) {
    const avgStars = product.reviews.reduce((acc, review) => acc + review.stars, 0) / product.reviews.length
    return product.avgStars >= 0 && product.avgStars <= 5 && avgStars === product.avgStars
  } else {
    return product.avgStars === null
  }
}

export { createProduct, getNewPaellaProductData, getNewCervezaProductData, getFirstProductFromRestaurant, getProductsFromRestaurant, getProductAlreadyOrdered, getNewUnavailablePaellaProductData, productHasCorrectAvgStars }
