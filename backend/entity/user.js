const { EntitySchema } = require('typeorm');
const bcrypt = require('bcryptjs');

const RoleEnum = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  CLIENT: "client"
};

const OrganizationRoleEnum = {
  MoDIR_KOL: "modir_kol",
  MODIR_ARSHAD: "modir_arshad",
  MODIR: "modir",
  KARMAND: "karmand",
  BAZRAS: "bazras",
  NAMEH_RESAN: "nameh_resan",
  HERASAT: "herasat",
  NEGAHBAN: "negahban",
  NO_ROL: "no_role"
};

const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    Organizational_role: {
      type: 'enum',
      enum: OrganizationRoleEnum,
      default: OrganizationRoleEnum.NO_ROL
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

module.exports = { User, RoleEnum, OrganizationRoleEnum };
