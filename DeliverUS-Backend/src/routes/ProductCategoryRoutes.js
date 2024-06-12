import ProductCategoryController from '../controllers/ProductCategoryController.js'

const loadFileRoutes = function (app) {
  app.route('/productCategories')
    .get(ProductCategoryController.index)
}
export default loadFileRoutes
