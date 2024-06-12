import { ProductCategory } from '../models/models.js'
const index = async function (req, res) {
  try {
    const productCategories = await ProductCategory.findAll()
    res.json(productCategories)
  } catch (err) {
    res.status(500).send(err)
  }
}
const ProductCategoryController = {
  index
}
export default ProductCategoryController
