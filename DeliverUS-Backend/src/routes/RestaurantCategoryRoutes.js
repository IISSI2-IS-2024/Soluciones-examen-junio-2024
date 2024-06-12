import RestaurantCategoryController from '../controllers/RestaurantCategoryController.js'

const loadFileRoutes = function (app) {
  app.route('/restaurantCategories')
    .get(RestaurantCategoryController.index)
}
export default loadFileRoutes
