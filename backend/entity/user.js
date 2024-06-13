// entity/User.js

const { EntitySchema } = require('typeorm');
const bcrypt = require('bcryptjs');

const RoleEnum = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  CLIENT: "client"
};

const User = new EntitySchema({
  name: 'User',
  tableName: 'users', // Optional: define table name explicitly
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    role: {
      type: 'enum',
      enum: RoleEnum,
      default: RoleEnum.CLIENT
    },
    username: {
      type: 'varchar'
    },
    password: {
      type: 'varchar'
    }
  },
  hooks: {
    beforeInsert: async (user) => {
      if (user.role === RoleEnum.SUPER_ADMIN) {
        user.password = await bcrypt.hash(user.password, 10);
      } else {
        throw new Error('Only superadmins can be registered via this API.');
      }
    }
  }
});

module.exports = { User, RoleEnum };
