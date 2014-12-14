"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("neighborhoods", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.INTEGER
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("neighborhoods").done(done);
  }
};