import { Model } from 'sequelize'
import bcrypt from 'bcryptjs'
const salt = bcrypt.genSaltSync(5)
const loadModel = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      User.hasMany(models.Restaurant, { foreignKey: 'userId' })
      User.hasMany(models.Order, { foreignKey: 'userId' })
    }
  }
  User.init({
    firstName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    lastName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
      set (value) {
        this.setDataValue('password', bcrypt.hashSync(value, salt))
      }
    },
    token: {
      allowNull: true,
      type: DataTypes.STRING
    },
    tokenExpiration: {
      allowNull: true,
      type: DataTypes.DATE
    },
    phone: {
      allowNull: false,
      type: DataTypes.STRING
    },
    avatar: {
      type: DataTypes.STRING
    },
    address: {
      allowNull: false,
      type: DataTypes.STRING
    },
    postalCode: {
      allowNull: false,
      type: DataTypes.STRING
    },
    userType: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: [
        'customer',
        'owner'
      ]
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  },
  {
    indexes: [
      {
        fields: ['token']
      }
    ],
    sequelize,
    modelName: 'User'
  })
  return User
}
export default loadModel
