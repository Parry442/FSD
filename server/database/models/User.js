const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Full name of the user'
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Viewer',
    comment: 'Role of the user in the system'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Department the user belongs to'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Phone number of the user'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL to user avatar image'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Active',
    comment: 'Current status of the user account'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last login timestamp'
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    comment: 'User permissions (stored as JSON string)',
    get() {
      const rawValue = this.getDataValue('permissions');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue('permissions', JSON.stringify(value || []));
    }
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.getFullName = function() {
  return this.name;
};

// Class methods
User.findByRole = function(role) {
  return this.findAll({ where: { role, status: 'Active' } });
};

User.findByDepartment = function(department) {
  return this.findAll({ where: { department, status: 'Active' } });
};

module.exports = User;