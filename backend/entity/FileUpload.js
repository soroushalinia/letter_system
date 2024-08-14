const { EntitySchema } = require('typeorm');
const { User } = require('./user');

const FileUpload = new EntitySchema({
  name: 'FileUpload',
  tableName: 'file_uploads',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true
    },
    filename: {
      type: 'varchar'
    },
    description: {
      type: 'varchar'
    },
    filePath: {
      type: 'varchar'
    },
    uploadedAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP'
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: User,
      joinColumn: true,
      onDelete: 'CASCADE'
    },
    recipient: {
      type: 'many-to-one',
      target: User,
      joinColumn: true,
      onDelete: 'CASCADE'
    }
  }
});

module.exports = { FileUpload };
