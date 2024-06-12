import * as ProductValidation from '../controllers/validation/ProductValidation.js'
import ProductController from '../controllers/ProductController.js'
import { Product } from '../models/models.js'
import { handleFilesUpload } from '../middlewares/FileHandlerMiddleware.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as ProductMiddleware from '../middlewares/ProductMiddleware.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'

const loadFileRoutes = (app) => {
  app.route('/products')
    .post(
      isLoggedIn,
      hasRole('owner'),
      handleFilesUpload(['image'], process.env.PRODUCTS_FOLDER),
      ProductValidation.create,
      handleValidation,
      ProductMiddleware.checkProductRestaurantOwnership,
      ProductController.create
    )
  app.route('/products/popular')
    .get(
      ProductController.popular
    )
  app.route('/products/:productId')
    .get(
      checkEntityExists(Product, 'productId'),
      ProductController.show)
    .put(
      isLoggedIn,
      hasRole('owner'),
      handleFilesUpload(['image'], process.env.PRODUCTS_FOLDER),
      checkEntityExists(Product, 'productId'),
      ProductMiddleware.checkProductOwnership,
      ProductValidation.update,
      handleValidation,
      ProductController.update
    )
    .delete(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Product, 'productId'),
      ProductMiddleware.checkProductOwnership,
      ProductMiddleware.checkProductHasNotBeenOrdered,
      ProductController.destroy
    )
}
export default loadFileRoutes
