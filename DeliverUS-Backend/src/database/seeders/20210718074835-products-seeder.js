const fs = require('fs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {})
    */

    module.exports.copyFiles()

    await queryInterface.bulkInsert('Products',
      [
        // Casa felix id=1
        // Starters id=1
        { name: 'Ensaladilla', description: 'Tuna salad with mayonnaise', price: 2.5, basePrice: 2.5, image: process.env.PRODUCTS_FOLDER + '/ensaladilla.jpeg', order: 1, availability: true, restaurantId: 1, productCategoryId: 1 },
        { name: 'Olives', description: 'Home made', price: 1.5, basePrice: 1.5, image: process.env.PRODUCTS_FOLDER + '/aceitunas.jpeg', order: 2, availability: true, restaurantId: 1, productCategoryId: 1 },

        // drinks id=3
        { name: 'Coca-cola', description: '33 cc', price: 1.5, basePrice: 1.5, image: process.env.PRODUCTS_FOLDER + '/cola.jpeg', order: 3, availability: true, restaurantId: 1, productCategoryId: 3 },
        { name: 'Water', description: '50 cc', price: 1, basePrice: 1, image: process.env.PRODUCTS_FOLDER + '/agua.png', order: 4, availability: true, restaurantId: 1, productCategoryId: 3 },
        { name: 'Coffee', description: 'expresso', price: 1.2, basePrice: 1.2, image: process.env.PRODUCTS_FOLDER + '/cafe.jpeg', order: 5, availability: true, restaurantId: 1, productCategoryId: 3 },

        // main courses id=4
        { name: 'Steak', description: 'Pork', price: 3.5, basePrice: 3.5, image: process.env.PRODUCTS_FOLDER + '/steak.jpeg', order: 6, availability: true, restaurantId: 1, productCategoryId: 4 },
        { name: 'Grilled tuna', description: 'with salad', price: 4.5, basePrice: 4.5, image: process.env.PRODUCTS_FOLDER + '/grilledTuna.jpeg', order: 7, availability: true, restaurantId: 1, productCategoryId: 4 },
        { name: 'Mexican burritos', description: 'tomato, chicken, cheese', price: 4, basePrice: 4, image: process.env.PRODUCTS_FOLDER + '/burritos.jpeg', order: 8, availability: true, restaurantId: 1, productCategoryId: 4 },
        // desserts id=5
        { name: 'Chocolate cake', description: '1 piece', price: 3, basePrice: 3, image: process.env.PRODUCTS_FOLDER + '/chocolateCake.jpeg', order: 11, availability: true, restaurantId: 1, productCategoryId: 5 },
        { name: 'Apple pie', description: '1 piece', price: 3, basePrice: 3, image: process.env.PRODUCTS_FOLDER + '/applePie.jpeg', order: 10, availability: false, restaurantId: 1, productCategoryId: 5 },
        { name: 'Churros', description: '5 pieces', price: 2, basePrice: 2, image: process.env.PRODUCTS_FOLDER + '/churros.jpeg', order: 9, availability: false, restaurantId: 1, productCategoryId: 5 },

        // 100 montaditos id=2
        // Starters id=1
        { name: 'Salchichón', description: '12 little pieces', price: 1.5, basePrice: 1.5, image: process.env.PRODUCTS_FOLDER + '/salchichon.jpeg', order: 1, availability: true, restaurantId: 2, productCategoryId: 1 },
        { name: 'Olives', description: '1 bowl', price: 1.5, basePrice: 1.5, image: process.env.PRODUCTS_FOLDER + '/aceitunas.jpeg', order: 2, availability: true, restaurantId: 2, productCategoryId: 1 },

        // drinks id=3
        { name: 'Coca-cola', description: '33 cc', price: 1.5, basePrice: 1.5, image: process.env.PRODUCTS_FOLDER + '/cola.jpeg', order: 3, availability: true, restaurantId: 2, productCategoryId: 3 },
        { name: 'Water', description: '50 cc', price: 1, basePrice: 1, image: process.env.PRODUCTS_FOLDER + '/agua.png', order: 4, availability: true, restaurantId: 2, productCategoryId: 3 },
        { name: 'Beer', description: '20 cc', price: 1, basePrice: 1, image: process.env.PRODUCTS_FOLDER + '/cerveza.jpeg', order: 5, availability: true, restaurantId: 2, productCategoryId: 3 },

        // Sandwiches id=6
        { name: 'Jamón', description: 'Cured Jam and olive oil', price: 1.5, basePrice: 1.5, image: process.env.PRODUCTS_FOLDER + '/montaditoJamon.jpeg', order: 6, availability: true, restaurantId: 2, productCategoryId: 6 },
        { name: 'Cheese and tomato', description: 'Iberian cheese and tomato', price: 1, basePrice: 1, image: process.env.PRODUCTS_FOLDER + '/montaditoQuesoTomate.jpeg', order: 7, availability: true, restaurantId: 2, productCategoryId: 6 },
        { name: 'Smoked salmon', description: 'Norwegian smoked salmon', price: 2, basePrice: 2, image: process.env.PRODUCTS_FOLDER + '/montaditoSalmon.jpeg', order: 8, availability: true, restaurantId: 2, productCategoryId: 6 },
        // desserts id=5
        { name: 'Chocolate ice-cream', description: '100 ml', price: 3, basePrice: 3, image: process.env.PRODUCTS_FOLDER + '/chocolateIceCream.jpeg', order: 9, availability: true, restaurantId: 2, productCategoryId: 5 },
        { name: 'Sweet sandwich', description: '1 piece', price: 1.5, basePrice: 1.5, image: process.env.PRODUCTS_FOLDER + '/montaditoChocolate.png', order: 10, availability: true, restaurantId: 2, productCategoryId: 5 },
        { name: 'Muffin', description: '1 piece', price: 1, basePrice: 1, image: process.env.PRODUCTS_FOLDER + '/muffin.jpeg', order: 11, availability: false, restaurantId: 2, productCategoryId: 5 }
      ], {})
    const thousandProducts = module.exports.createNProducts(1000, 3)
    await queryInterface.bulkInsert('Products', thousandProducts)

    const thirtyProducts = module.exports.createNProducts(30, 5)
    await queryInterface.bulkInsert('Products', thirtyProducts)

    const fiftyProducts = module.exports.createNProducts(50, 6)
    await queryInterface.bulkInsert('Products', fiftyProducts)

    const hundredProducts = module.exports.createNProducts(100, 7)
    await queryInterface.bulkInsert('Products', hundredProducts)

    const twoHundredProducts = module.exports.createNProducts(200, 8)
    await queryInterface.bulkInsert('Products', twoHundredProducts)

    const oneProduct = module.exports.createNProducts(1, 9)
    await queryInterface.bulkInsert('Products', oneProduct)
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {})
     */
    const { sequelize } = queryInterface
    try {
      await sequelize.transaction(async (transaction) => {
        const options = { transaction }
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', options)
        await sequelize.query('TRUNCATE TABLE Products', options)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', options)
      })
    } catch (error) {
      console.error(error)
    }
  },

  copyFiles: () => {
    const originDir = 'public/example_assets/'
    const destinationDir = process.env.PRODUCTS_FOLDER + '/'
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true })
    }
    const productsFilenames = ['aceitunas.jpeg', 'agua.png', 'applePie.jpeg', 'burritos.jpeg', 'cafe.jpeg', 'cerveza.jpeg', 'chocolateCake.jpeg', 'chocolateIceCream.jpeg', 'churros.jpeg', 'cola.jpeg', 'ensaladilla.jpeg', 'femaleAvatar.png', 'grilledTuna.jpeg', 'heroImage.jpg', 'logo.jpeg', 'maleAvatar.png', 'montaditoChocolate.png', 'montaditoJamon.jpeg', 'montaditoQuesoTomate.jpeg', 'montaditoSalmon.jpeg', 'muffin.jpeg', 'paella.jpeg', 'salchichon.jpeg', 'steak.jpeg']
    productsFilenames.forEach(productFilename => {
      fs.copyFile(originDir + productFilename, destinationDir + productFilename, (err) => {
        if (err) throw err
      })
    })
  },
  createNProducts: (numProducts, restaurantId) => {
    const productsArray = []
    for (let i = 0; i < numProducts; i++) {
      productsArray[i] = { name: 'Product #' + i, description: 'Description #' + i, price: i, basePrice: i, image: process.env.PRODUCTS_FOLDER + '/agua.png', order: i, availability: true, restaurantId, productCategoryId: 5 }
    }
    return productsArray
  }
}
