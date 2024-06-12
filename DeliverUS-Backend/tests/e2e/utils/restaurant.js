import request from 'supertest'
import { getApp } from './testApp'
import { bodeguitaRestaurant, generateFakeUser } from './testData'
let firstRestaurantOfOwner

const createRestaurant = async (owner) => {
  if (!owner) { owner = (await request(await getApp()).post('/users/registerOwner').send(await generateFakeUser())).body }
  const validRestaurant = { ...bodeguitaRestaurant }
  validRestaurant.restaurantCategoryId = (await request(await getApp()).get('/restaurantCategories').send()).body[0].id
  return (await request(await getApp()).post('/restaurants').set('Authorization', `Bearer ${owner.token}`).send(validRestaurant)).body
}

const getFirstRestaurantOfOwner = async (owner) => {
  if (firstRestaurantOfOwner) return firstRestaurantOfOwner
  firstRestaurantOfOwner = (await request(await getApp()).get('/users/myRestaurants').set('Authorization', `Bearer ${owner.token}`).send()).body[0]
  return firstRestaurantOfOwner
}

const getRandomRestaurant = async (restaurantToExclude) => {
  const restaurants = (await request(await getApp()).get('/restaurants').send()).body
  if (restaurantToExclude) { restaurants.filter(restaurant => restaurant.id !== restaurantToExclude.id) }
  return restaurants[Math.floor(Math.random() * restaurants.length)]
}

export { createRestaurant, getFirstRestaurantOfOwner, getRandomRestaurant }
