import { check } from 'express-validator'
import { Restaurant } from '../../models/models.js'
import { checkFileIsImage, checkFileMaxSize } from './FileValidationHelper.js'

const maxFileSize = 2000000 // around 2Mb

const checkRestaurantExists = async (value, { req }) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant === null) {
      return Promise.reject(new Error('The restaurantId does not exist.'))
    } else { return Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}
const create = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('description').optional({ checkNull: true, checkFalsy: true }).isString().isLength({ min: 1 }).trim(),
  check('price').exists().isFloat({ min: 0 }).toFloat(),
  check('order').default(null).optional({ nullable: true }).isInt().toInt(),
  check('availability').optional().isBoolean().toBoolean(),
  check('productCategoryId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('image').custom((value, { req }) => {
    return checkFileIsImage(req, 'image')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('image').custom((value, { req }) => {
    return checkFileMaxSize(req, 'image', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  // Solution
  check('visibleUntil').optional().isDate().toDate(),
  check('visibleUntil').custom((value, { req }) => {
    const currentDate = new Date()
    if (value && value < currentDate) {
      return Promise.reject(new Error('The visibility must finish after the current date.'))
    } else { return Promise.resolve() }
  }),
  check('availability').custom((value, { req }) => {
    if (value === false && req.body.visibleUntil) {
      return Promise.reject(new Error('Cannot set the availability and visibility at the same time.'))
    } else { return Promise.resolve() }
  })
]

const update = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }),
  check('description').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1 }).trim(),
  check('price').exists().isFloat({ min: 0 }).toFloat(),
  check('order').default(null).optional({ nullable: true }).isInt().toInt(),
  check('availability').optional().isBoolean().toBoolean(),
  check('productCategoryId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').not().exists(),
  check('image').custom((value, { req }) => {
    return checkFileIsImage(req, 'image')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('image').custom((value, { req }) => {
    return checkFileMaxSize(req, 'image', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  check('restaurantId').not().exists(),
  // Solution
  check('visibleUntil').optional().isDate().toDate(),
  check('visibleUntil').custom((value, { req }) => {
    const currentDate = new Date()
    if (value && value < currentDate) {
      return Promise.reject(new Error('The visibility must finish after the current date.'))
    } else { return Promise.resolve() }
  }),
  check('availability').custom((value, { req }) => {
    if (value === false && req.body.visibleUntil) {
      return Promise.reject(new Error('Cannot set the availability and visibility at the same time.'))
    } else { return Promise.resolve() }
  })
]

export { create, update }
