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

    await queryInterface.bulkInsert('Restaurants',
      [
        { name: 'Casa Félix', description: 'Cocina Tradicional', address: 'Av. Reina Mercedes 51, Sevilla', postalCode: '41012', url: 'https://goo.gl/maps/GZEfzge4zXz6ySLR8', restaurantCategoryId: 1, shippingCosts: 2.5, email: 'casafelix@restaurant.com', logo: process.env.RESTAURANTS_FOLDER + '/casaFelixLogo.jpeg', phone: 954123123, createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'closed' },
        { name: '100 montaditos', description: 'A fun and varied way to enjoy food. A place to share experiences and get carried away by the moment.', address: 'Józefa 34, Kraków, Poland', postalCode: '123-4567', logo: 'public/restaurants/100MontaditosLogo.jpeg', heroImage: 'public/restaurants/100MontaditosHero.jpeg', url: 'http://spain.100montaditos.com/', restaurantCategoryId: 2, shippingCosts: 1.5, email: 'info@restaurant.com', phone: '+48123456789', createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'online' },
        { name: '1000 products', description: '1000 products', address: 'Józefa 34, Kraków, Poland', postalCode: '123-4567', url: 'http://1000products.com/', restaurantCategoryId: 2, shippingCosts: 1.5, email: 'info@restaurant.com', phone: '+48123456789', createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'online' },
        { name: '0 products', description: '0 products', address: 'Józefa 34, Kraków, Poland', postalCode: '123-4567', url: 'http://1000products.com/', restaurantCategoryId: 2, shippingCosts: 1.5, email: 'info@restaurant.com', phone: '+48123456789', createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'closed' },
        { name: '30 products', description: '1000 products', address: 'Józefa 34, Kraków, Poland', postalCode: '123-4567', url: 'http://1000products.com/', restaurantCategoryId: 2, shippingCosts: 1.5, email: 'info@restaurant.com', phone: '+48123456789', createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'online' },
        { name: '50 products', description: '1000 products', address: 'Józefa 34, Kraków, Poland', postalCode: '123-4567', url: 'http://1000products.com/', restaurantCategoryId: 2, shippingCosts: 1.5, email: 'info@restaurant.com', phone: '+48123456789', createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'online' },
        { name: '100 products', description: '1000 products', address: 'Józefa 34, Kraków, Poland', postalCode: '123-4567', url: 'http://1000products.com/', restaurantCategoryId: 2, shippingCosts: 1.5, email: 'info@restaurant.com', phone: '+48123456789', createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'online' },
        { name: '200 products', description: '1000 products', address: 'Józefa 34, Kraków, Poland', postalCode: '123-4567', url: 'http://1000products.com/', restaurantCategoryId: 2, shippingCosts: 1.5, email: 'info@restaurant.com', phone: '+48123456789', createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'online' },
        { name: '1 product', description: '1 product', address: 'Józefa 34, Kraków, Poland', postalCode: '123-4567', url: 'http://1000products.com/', restaurantCategoryId: 2, shippingCosts: 1.5, email: 'info@restaurant.com', phone: '+48123456789', createdAt: new Date(), updatedAt: new Date(), userId: 2, status: 'online' }
      ], {})
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
        await sequelize.query('TRUNCATE TABLE Restaurants', options)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', options)
      })
    } catch (error) {
      console.error(error)
    }
  },
  copyFiles: () => {
    const originDir = 'public/example_assets/'
    const destinationDir = process.env.RESTAURANTS_FOLDER + '/'
    console.error(destinationDir)
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true })
    }
    const restaurantsFilenames = ['casaFelixLogo.jpeg', 'casaFelixHero.jpeg', '100MontaditosHero.jpeg', '100MontaditosLogo.jpeg']
    restaurantsFilenames.forEach(resturantFilename => {
      fs.copyFile(originDir + resturantFilename, destinationDir + resturantFilename, (err) => {
        if (err) throw err
      })
    })
  }
}
