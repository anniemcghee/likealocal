"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("categories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      tag: {
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
    migration.dropTable("categories").done(done);
  }
};