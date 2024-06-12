import { check } from 'express-validator'
import { checkFileIsImage, checkFileMaxSize } from './FileValidationHelper.js'

const maxFileSize = 2000000 // around 2Mb

const create = [
  check('firstName').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('lastName').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('email').exists().isString().isEmail().normalizeEmail(),
  check('password').exists().isString().isStrongPassword({ minLength: 3 }),
  check('password').custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the password'),
  check('phone').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('postalCode').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('avatar').custom((value, { req }) => {
    return checkFileIsImage(req, 'avatar')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('avatar').custom((value, { req }) => {
    return checkFileMaxSize(req, 'avatar', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB')
]
const update = [
  check('firstName').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('lastName').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('email').not().exists(),
  check('phone').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('postalCode').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('avatar').custom((value, { req }) => {
    return checkFileIsImage(req, 'avatar')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('avatar').custom((value, { req }) => {
    return checkFileMaxSize(req, 'avatar', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB')
]
const login = [
  check('email').exists().isString().isEmail().normalizeEmail(),
  check('password').exists().isString()
]

export { create, update, login }
